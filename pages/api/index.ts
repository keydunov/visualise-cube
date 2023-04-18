import { getDMMF } from "@prisma/internals";
import { NextApiRequest, NextApiResponse } from "next";
import stripAnsi from "strip-ansi";
import yaml from "js-yaml";

import { parseDMMFError } from "~/util";
import { ErrorTypes } from "~/util/types";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const schema = req.body.schema as string;
    const parsedYaml = yaml.load(schema);
    let resp = {
      nodes: [],
      edges: []
    };

    if (!parsedYaml.cubes || parsedYaml.cubes.legnth < 1) {
      return resp
    }

    parsedYaml.cubes.forEach((cube) => {
      resp.nodes.push({
        id: cube.name,
        type: "cube",
        data: { name: cube.name, measures: cube.measures || [], dimensions: cube.dimensions || [] },
        position: { x: 250, y: 25 }
      })
       
      if (cube.joins && cube.joins.length > 0) {
        const edgesKeys = resp.edges.map(edge => edge.id)
        cube.joins.forEach((join) => {
          const target = join.name;
          const source = cube.name;
          const edgeId = `${source}-${target}`;
          if (!edgesKeys.includes(edgeId) && !edgesKeys.includes(`${target}-${source}`)) {
            resp.edges.push({
              id: edgeId,
              type: "relation",
              target,
              source,
              data: {
                relationType: join.relationship
              }
            })
          }
        });
      }
    });

    console.log(resp);
    res.json(resp);
  } catch (err) {
    const message = stripAnsi((err as Error).message);
    let errors: any;
    let errType: ErrorTypes;

    if (message.includes("error: ")) {
      errors = parseDMMFError(message);
      errType = ErrorTypes.Prisma;
    } else {
      console.error(err);

      errors = message;
      errType = ErrorTypes.Other;
    }

    res.status(400).json({ errors, type: errType });
  }
}
