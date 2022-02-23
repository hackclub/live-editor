// not functioning yet

import { dispatch } from "./dispatch.js";
import md5 from "https://cdn.skypack.dev/md5";
import copy from "./utils/copy.js";

export const hashState = () => md5(dispatch("GET_SAVE_STATE"));

async function saveToS3({ content, state, copyUrl }) {
  const uniqueID = md5(JSON.stringify(content));
  const { exists, uploadURL, jsonFilename, id } = await fetch(
    `https://vt4x133ukg.execute-api.eu-west-1.amazonaws.com/default/getPresignedURL?id=${uniqueID}`
  ).then((r) => r.json());
  if (!exists) {
    await fetch(uploadURL, {
      mode: "cors",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    });
  }

  const link = window.location.origin + `/share/${id}`;

  if (copyUrl) copy(link);
  if (copyUrl)
    dispatch("NOTIFICATION", {
      message: "Sharing link copied to clipboard!",
      timeout: 3000,
    });

  state.lastSaved.name = content.name;
  state.lastSaved.prog = content.prog;
  state.lastSaved.link = link;
  return link;
}