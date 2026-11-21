import { createCn } from "cn/config"

/** Class merger that knows the Kuriftu type scale (text-h1 … text-caption). */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["h1", "h2", "h3", "h4", "body", "small", "caption"] },
      ],
    },
  },
})
