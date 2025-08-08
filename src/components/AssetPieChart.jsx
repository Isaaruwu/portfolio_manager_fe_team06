import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { useState, useEffect } from "react";

import userService from "../services/userService";


const AssetPieChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
      const fetchHoldings = async () => {
        try {
          const data = await userService.getHoldings(1);
          const total_value = data.reduce((acc, holding) => acc + (holding.quantity * holding.avg_price), 0);
          const holdingsData = data.map((holding, index) => ({
            id: holding.ticker,
            label: holding.ticker,
            value: parseFloat(((holding.quantity * holding.avg_price)/total_value * 100).toFixed(2)),
            color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
          }));
          setHoldings(holdingsData);
        } catch (err) {
          console.error('Failed to fetch holdings data:', err);
        }
      };
  
      fetchHoldings();
    }, []);

  return (
    <ResponsivePie
      data={holdings}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        labels: {
        text: {
          fontSize: 20,
        },
      },
      }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={true}
      arcLabel={e=>`${e.value} %`}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
    />
  );
};

export default AssetPieChart;
