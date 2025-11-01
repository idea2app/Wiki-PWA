import { DocumentModel } from "mobx-lark";

import { lark } from "../api/Lark/core";
import { LarkWikiDomain } from "../configuration";

export class MyDocumentModel extends DocumentModel {
  client = lark.client;
}

export default new MyDocumentModel(LarkWikiDomain);
