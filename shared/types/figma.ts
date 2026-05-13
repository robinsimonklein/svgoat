export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
};

export type FigmaInspectedFile = {
  key: string;
  node: FigmaNode;
};
