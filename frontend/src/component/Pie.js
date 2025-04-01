import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, ArcElement } from "chart.js";
import { pieChartData } from "/assets/FAKE-DATA.js";

ChartJS.register(Tooltip, ArcElement);

export const PieChart = () => {
  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Pie options={options} data={pieChartData} />;
};
