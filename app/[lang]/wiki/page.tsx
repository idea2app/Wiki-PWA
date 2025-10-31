import { WikiNode } from "mobx-lark";
import { treeFrom } from "web-utility";

import { lark } from "@/lib/api/Lark/core";
import wikiStore from "@/lib/models/Wiki";

type XWikiNode = WikiNode & {
  // eslint-disable-next-line no-restricted-syntax
  children?: XWikiNode[];
};

const renderTree = (children?: XWikiNode[]) =>
  children && (
    <ol className="list-decimal space-y-2 pl-6">
      {children.map(({ node_token, title, children }) => (
        <li key={node_token}>
          <a
            href={`wiki/${node_token}`}
            className="text-blue-600 hover:underline"
          >
            {title}
          </a>
          {renderTree(children)}
        </li>
      ))}
    </ol>
  );

export default async function WikiIndexPage() {
  await lark.getAccessToken();

  const nodes = await wikiStore.getAll();

  return (
    <div className="prose container mx-auto max-w-screen-xl px-4 pt-24 pb-6">
      <h1>Wiki</h1>
      {renderTree(
        treeFrom(nodes, "node_token", "parent_node_token", "children"),
      )}
    </div>
  );
}
