import * as acorn from "acorn"

/**
 * Static evaluation of the live site's compiled bundle. The bundle is parsed,
 * never executed. Literal objects, arrays and JSX element trees are turned into
 * plain JSON; anything dynamic becomes `{ $expr: "<source>" }`.
 */

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

export interface Literal {
  /** Character offset of the literal in the bundle (stable for one bundle). */
  start: number
  value: Json
}

type Node = acorn.Node & Record<string, unknown>

const MEDIA_MODULE = /(\d+):\(e,t,n\)=>\{"use strict";e\.exports=n\.p\+"(static\/media\/[^"]+)"\}/g

/** Webpack module id → absolute URL, for `n(<id>)` image imports. */
export function mediaModules(bundle: string, origin: string): Map<number, string> {
  const map = new Map<number, string>()
  // -1 holds the origin, for inlined `n.p+"static/media/…"` paths.
  map.set(-1, origin)
  for (const match of bundle.matchAll(MEDIA_MODULE)) map.set(Number(match[1]), `${origin}/${match[2]}`)
  return map
}

/** `n(1234)` (a media module) or `n.p+"static/media/…"` (inlined public path) → absolute URL. */
const isMediaCall = (node: Node | null | undefined, media: Map<number, string>): string | undefined => {
  if (!node) return undefined
  // Minifier leftovers: (n.p, n.p, n.p+"static/media/…") → last expression.
  if (node.type === "SequenceExpression") return isMediaCall((node.expressions as Node[]).at(-1), media)
  if (node.type === "CallExpression") {
    const args = node.arguments as Node[]
    if (args.length === 1 && args[0].type === "Literal" && typeof args[0].value === "number") return media.get(args[0].value)
  }
  if (node.type === "BinaryExpression" && node.operator === "+") {
    const left = node.left as Node
    const right = node.right as Node
    const isPublicPath = left.type === "MemberExpression" && (left.property as Node).name === "p"
    if (isPublicPath && right.type === "Literal" && typeof right.value === "string") return `${media.get(-1)}/${right.value}`
  }
  return undefined
}

const URL_LIKE = /^(https?:\/\/|\/assets\/)/

/** A string literal that looks like an absolute or `/assets/` URL. */
const urlLiteral = (node: Node | null | undefined): string | undefined =>
  node?.type === "Literal" && typeof node.value === "string" && URL_LIKE.test(node.value) ? node.value : undefined

/** A `name = …` declaration and the function (or program) it is scoped to. */
interface Binding {
  url: string | null
  /** For object constants (`O_ = { hero: n(1), … }`): property → URL, or `@name` for an identifier. */
  props?: Record<string, string>
  scopeStart: number
  scopeEnd: number
}

/** Resolves `name` (or `name.prop`) at a source offset to an image URL. */
export type Resolver = (name: string, offset: number, prop?: string) => string | undefined

/**
 * Minified image constants (`const pl = n(1234)` or `pl = "https://…"`).
 * Names repeat across webpack modules, so a usage resolves to the declaration
 * in the innermost enclosing function that declares the name (lexical scope;
 * block scopes ignored). Non-image declarations shadow too and stay `$expr`.
 */
export function imageBindings(ast: Node, media: Map<number, string>): Resolver {
  const byName = new Map<string, Binding[]>()
  ;(function walk(node: Node, scope: Node) {
    if (node.type === "VariableDeclarator" && (node.id as Node).type === "Identifier") {
      const init = node.init as Node | null
      const url = isMediaCall(init, media) ?? urlLiteral(init) ?? null
      const name = (node.id as Node).name as string
      let props: Record<string, string> | undefined
      if (init?.type === "ObjectExpression") {
        props = {}
        for (const prop of init.properties as Node[]) {
          if (prop.type !== "Property" || prop.computed || (prop.key as Node).type !== "Identifier") continue
          const value = prop.value as Node
          const found =
            isMediaCall(value, media) ??
            urlLiteral(value) ??
            (value.type === "Identifier" ? `@${value.name as string}` : undefined)
          if (found) props[(prop.key as Node).name as string] = found
        }
      }
      const list = byName.get(name) ?? []
      list.push({ url, props, scopeStart: scope.start, scopeEnd: scope.end })
      byName.set(name, list)
    }
    const inner = /Function/.test(node.type) ? node : scope
    for (const key of Object.keys(node)) {
      const child = node[key]
      if (Array.isArray(child)) {
        for (const c of child) if (c && typeof c === "object" && typeof (c as Node).type === "string") walk(c as Node, inner)
      } else if (child && typeof child === "object" && typeof (child as Node).type === "string") walk(child as Node, inner)
    }
  })(ast, ast)

  const lookup = (name: string, offset: number): Binding | undefined => {
    let best: Binding | undefined
    for (const b of byName.get(name) ?? []) {
      const contains = b.scopeStart <= offset && offset < b.scopeEnd
      if (contains && (!best || b.scopeEnd - b.scopeStart < best.scopeEnd - best.scopeStart)) best = b
    }
    return best
  }

  const resolve: Resolver = (name, offset, prop) => {
    const binding = lookup(name, offset)
    if (!binding) return undefined
    if (prop === undefined) return binding.url ?? undefined
    const value = binding.props?.[prop]
    if (!value) return undefined
    // An identifier inside the object: resolve it from the object's own scope.
    return value.startsWith("@") ? resolve(value.slice(1), binding.scopeStart + 1) : value
  }
  return resolve
}

export function evaluator(bundle: string, media: Map<number, string>, resolve: Resolver = () => undefined) {
  const expr = (node: Node): Json => ({ $expr: bundle.slice(node.start, Math.min(node.end, node.start + 80)) })

  function evaluate(node: Node): Json {
    switch (node.type) {
      case "Identifier":
        return resolve(node.name as string, node.start) ?? expr(node)
      case "MemberExpression": {
        const object = node.object as Node
        const property = node.property as Node
        if (object.type === "Identifier" && !node.computed && property.type === "Identifier") {
          return resolve(object.name as string, node.start, property.name as string) ?? expr(node)
        }
        return expr(node)
      }
      case "Literal": {
        const value = node.value
        if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value
        return expr(node)
      }
      case "TemplateLiteral": {
        const quasis = node.quasis as Node[]
        const exprs = node.expressions as Node[]
        if (exprs.length === 0) return (quasis[0].value as { cooked: string }).cooked
        return expr(node)
      }
      case "UnaryExpression": {
        // Minified booleans: !0 / !1.
        const arg = node.argument as Node
        if (node.operator === "!" && arg.type === "Literal" && typeof arg.value === "number") return !arg.value
        if (node.operator === "-" && arg.type === "Literal" && typeof arg.value === "number") return -arg.value
        return expr(node)
      }
      case "ArrayExpression":
        return (node.elements as (Node | null)[]).map((el) => (el ? evaluate(el) : null))
      case "ObjectExpression": {
        const out: Record<string, Json> = {}
        for (const prop of node.properties as Node[]) {
          if (prop.type !== "Property" || prop.computed) continue
          const key = prop.key as Node
          const name = key.type === "Identifier" ? (key.name as string) : String(key.value)
          out[name] = evaluate(prop.value as Node)
        }
        return out
      }
      case "BinaryExpression":
        return isMediaCall(node, media) ?? expr(node)
      case "CallExpression": {
        const args = node.arguments as Node[]
        const url = isMediaCall(node, media)
        if (url) return url
        // JSX: (0,X.jsx)(tag, props) / jsxs
        const callee = node.callee as Node
        const fn = callee.type === "SequenceExpression" ? (callee.expressions as Node[]).at(-1)! : callee
        if (
          fn.type === "MemberExpression" &&
          ["jsx", "jsxs"].includes(((fn.property as Node).name as string) ?? "") &&
          args.length >= 2
        ) {
          const tag = args[0]
          return {
            $el: tag.type === "Literal" ? String(tag.value) : `$${bundle.slice(tag.start, tag.end).slice(0, 40)}`,
            props: evaluate(args[1]),
          }
        }
        return expr(node)
      }
      default:
        return expr(node)
    }
  }

  return evaluate
}

/** Counts plain-text characters inside a value, ignoring `$expr` stubs. */
export function textWeight(value: Json): number {
  if (typeof value === "string") return value.length
  if (Array.isArray(value)) return value.reduce<number>((sum, v) => sum + textWeight(v), 0)
  if (value && typeof value === "object") {
    if ("$expr" in value) return 0
    return Object.values(value).reduce<number>((sum, v) => sum + textWeight(v), 0)
  }
  return 0
}

/**
 * Every maximal object/array/JSX literal in the bundle that carries real text
 * (at least `minText` characters), in source order.
 */
export function extractLiterals(bundle: string, origin: string, minText = 40): Literal[] {
  const ast = acorn.parse(bundle, { ecmaVersion: "latest", sourceType: "script" }) as unknown as Node
  const media = mediaModules(bundle, origin)
  const evaluate = evaluator(bundle, media, imageBindings(ast, media))
  const out: Literal[] = []

  const isCandidate = (node: Node) =>
    node.type === "ObjectExpression" ||
    node.type === "ArrayExpression" ||
    (node.type === "CallExpression" && evaluateIsJsx(node))

  function evaluateIsJsx(node: Node): boolean {
    const callee = node.callee as Node
    const fn = callee.type === "SequenceExpression" ? (callee.expressions as Node[]).at(-1)! : callee
    return fn.type === "MemberExpression" && ["jsx", "jsxs"].includes(((fn.property as Node).name as string) ?? "")
  }

  function visit(node: Node, insideRecorded: boolean) {
    // A function inside a recorded literal is opaque to it, so its body is scanned on its own.
    let recorded = insideRecorded && !/Function/.test(node.type)
    if (!recorded && isCandidate(node)) {
      const value = evaluate(node)
      if (textWeight(value) >= minText) {
        out.push({ start: node.start, value })
        recorded = true
      }
    }
    for (const key of Object.keys(node)) {
      if (key === "type" || key === "start" || key === "end") continue
      const child = node[key]
      if (Array.isArray(child)) {
        for (const c of child) if (c && typeof c === "object" && typeof (c as Node).type === "string") visit(c as Node, recorded)
      } else if (child && typeof child === "object" && typeof (child as Node).type === "string") {
        visit(child as Node, recorded)
      }
    }
  }

  visit(ast, false)
  return out
}
