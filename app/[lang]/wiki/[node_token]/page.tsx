import { renderBlocks } from "mobx-lark";
import { notFound } from "next/navigation";

import { lark } from "@/lib/api/Lark/core";
import documentStore from "@/lib/models/Document";
import wikiStore from "@/lib/models/Wiki";

interface WikiDocumentPageProps {
  params: Promise<{ node_token: string }>;
}

export default async function WikiDocumentPage({
  params,
}: WikiDocumentPageProps) {
  const { node_token } = await params;

  await lark.getAccessToken();

  const node = await wikiStore.getOne(node_token);

  if (node?.obj_type !== "docx") notFound();

  const blocks = await documentStore.getOneBlocks(
    node.obj_token,
    (token) => `/api/Lark/file/${token}`,
  );

  return (
    <div className="prose container mx-auto max-w-screen-xl px-4 pt-24 pb-6">
      {renderBlocks(blocks)}
    </div>
  );
}
