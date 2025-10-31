"use client";

import { WikiNode } from "mobx-lark";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
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

const WikiIndexPage = observer(() => {
  const [nodes, setNodes] = useState<XWikiNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWiki = async () => {
      try {
        await lark.getAccessToken();
        const wikiNodes = await wikiStore.getAll();
        setNodes(wikiNodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load wiki");
        console.error("Error loading wiki:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWiki();
  }, []);

  if (loading) {
    return (
      <div className="prose container mx-auto max-w-screen-xl px-4 pt-24 pb-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prose container mx-auto max-w-screen-xl px-4 pt-24 pb-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="prose container mx-auto max-w-screen-xl px-4 pt-24 pb-6">
      <h1>Wiki</h1>
      {renderTree(
        treeFrom(nodes, "node_token", "parent_node_token", "children"),
      )}
    </div>
  );
});

export default WikiIndexPage;
