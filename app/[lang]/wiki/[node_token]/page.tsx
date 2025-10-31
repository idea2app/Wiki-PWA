"use client";

import { Block, renderBlocks, WikiNode } from "mobx-lark";
import { useEffect, useState } from "react";

import { lark } from "@/lib/api/Lark/core";
import documentStore from "@/lib/models/Document";
import wikiStore from "@/lib/models/Wiki";

interface WikiDocumentPageProps {
  params: Promise<{ node_token: string }>;
}

export default function WikiDocumentPage({ params }: WikiDocumentPageProps) {
  const [node, setNode] = useState<WikiNode | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [blocks, setBlocks] = useState<Block<any, any, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodeToken, setNodeToken] = useState<string>("");

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setNodeToken(resolvedParams.node_token);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!nodeToken) return;

    const loadDocument = async () => {
      try {
        await lark.getAccessToken();

        const wikiNode = await wikiStore.getOne(nodeToken);

        if (!wikiNode || wikiNode.obj_type !== "docx") {
          setError("Document not found or invalid type");
          setLoading(false);

          return;
        }

        setNode(wikiNode);

        const docBlocks = await documentStore.getOneBlocks(
          wikiNode.obj_token,
          (token) => `/api/Lark/file/${token}`,
        );

        setBlocks(docBlocks);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load document",
        );
        console.error("Error loading document:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [nodeToken]);

  if (loading) {
    return (
      <div className="prose container mx-auto max-w-screen-xl px-4 pt-24 pb-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="prose container mx-auto max-w-screen-xl px-4 pt-24 pb-6">
        <p className="text-red-600">Error: {error || "Document not found"}</p>
      </div>
    );
  }

  return (
    <div className="prose container mx-auto max-w-screen-xl px-4 pt-24 pb-6">
      <h1>{node.title}</h1>
      {renderBlocks(blocks)}
    </div>
  );
}
