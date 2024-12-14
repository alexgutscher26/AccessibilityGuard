export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
  }[];
}

export interface ChartProps {
  data: ChartData;
  title?: string;
  height?: number;
  width?: number;
  className?: string;
}
