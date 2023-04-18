import { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useState } from "react";
import { useDebounce, useLocalStorage } from "react-use";
import useFetch from "use-http";

import CopyButton from "~/components/CopyButton";
import EditorView from "~/components/EditorView";
import FlowView from "~/components/FlowView";
import Layout from "~/components/Layout";
import { fromUrlSafeB64 } from "~/util";
import { ErrorTypes, SchemaError } from "~/util/types";

import type { DMMF } from "@prisma/generator-helper";
import type { editor } from "monaco-editor";

const initial = `
cubes:
  - name: base_orders
    sql_table: public.orders
    public: false

    joins:
      - name: users
        sql: "{CUBE}.user_id = {users}.id"
        relationship: many_to_one

    measures:
      - name: count
        type: count

    dimensions:
      - name: id
        sql: id
        type: number
        primary_key: true

      - name: status
        sql: status
        type: string

  - name: users
    sql_table: public.users
    public: false

    measures:
      - name: count
        type: count

    dimensions:
      - name: id
        sql: id
        type: number
        primary_key: true

      - name: city
        sql: city
        type: string
`.trim();

const IndexPage = () => {
  // TODO: multiple save states.
  const [storedText, setStoredText] = useLocalStorage(
    "cubedatamodel.text",
    initial
  );
  const [text, setText] = useState(storedText!);
  const [schemaErrors, setSchemaErrors] = useState<SchemaError[]>([]);
  const [dmmf, setDMMF] = useState<DMMF.Datamodel | null>(null);
  const { post, response, loading } = useFetch("/api");
  const monaco = useMonaco();

  const submit = async () => {
    setStoredText(text);
    // TODO: get meta
    const resp = await post({ schema: text });

    if (response.ok) {
      setDMMF(resp);
      setSchemaErrors([]);
    } else if (resp.type === ErrorTypes.Prisma) setSchemaErrors(resp.errors);
    else console.error(resp);
  };

  const format = async () => {
    const resp = await post("/format", { schema: text });
    if (response.ok) setText(resp.formatted);
  };

  useDebounce(submit, 1000, [text]);

  useEffect(() => {
    // Set error squiggles in the editor if we have any
    if (!monaco) return;

    const markers = schemaErrors.map<editor.IMarkerData>((err) => ({
      message: err.reason,
      startLineNumber: Number(err.row),
      endLineNumber: Number(err.row),
      startColumn: 0,
      endColumn: 9999,
      severity: 8,
    }));
    const [model] = monaco.editor.getModels();

    monaco.editor.setModelMarkers(model, "prismaliser", markers);
  }, [monaco, schemaErrors]);

  useEffect(() => {
    // Populate state from a shared link if one is present
    const params = new URLSearchParams(location.search);

    if (params.has("code")) {
      const code = params.get("code")!;
      const decoded = fromUrlSafeB64(code);

      setText(decoded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <section className="relative flex flex-col items-start border-r-2">
        <EditorView value={text} onChange={(val) => setText(val!)} />

        <div className="absolute flex gap-2 left-4 bottom-4">
          <CopyButton input={text} />

          <button type="button" className="button floating" onClick={format}>
            Format
          </button>
        </div>

        {loading ? (
          <div className="absolute w-4 h-4 border-2 border-b-0 border-l-0 border-blue-500 rounded-full right-4 bottom-4 animate-spin" />
        ) : null}
      </section>
      <pre className="overflow-auto border-l-2">
        <FlowView dmmf={dmmf} />
        {/* TODO: add a toggleable "debug" view that shows the raw data? */}
        {/* {JSON.stringify(data, null, 4)} */}
      </pre>
    </Layout>
  );
};

export default IndexPage;
