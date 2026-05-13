export type SvgSource =
  | { type: 'figma'; fileUrl: string; nodeUrl: string; nodeId: string }
  | { type: 'clipboard' }
  | { type: 'filesystem' };

export type SvgInput = {
  id: string;
  text: string;
  width: number;
  height: number;
  source: SvgSource;
  filename?: string;
};

export type OptimizedSvg = {
  id: string;
  text: string;
  width: number;
  height: number;
  rawSize: number;
  optimizedSize: number;
};
