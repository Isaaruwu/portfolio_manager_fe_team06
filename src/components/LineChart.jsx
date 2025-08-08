import { ResponsiveLine } from "@nivo/line";
import { useState, useEffect } from "react";
import { useTheme, Box, Typography } from "@mui/material";

import { tokens } from "../theme";
import userService from "../services/userService";


const LineChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [growthData, setGrowthData] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    currentValue: 0,
    lastUpdate: '',
    investedAmount: 0,
    cashBalance: 0
  });
  
  useEffect(() => {
      const fetchGrowthData = async () => {
        try {
          const data = await userService.getGrowth(1);
          const formatted = data.map(item => ({
            x: new Date(item.date).toISOString().slice(0,10).replace(/-/g,'/'),
            y: item.portfolio_value + item.cash_balance
          }));
          if (data.length > 0) {
            const latestData = data[data.length - 1];
            setPortfolioStats({
              currentValue: latestData.portfolio_value + latestData.cash_balance,
              lastUpdate: new Date(latestData.date).toLocaleDateString(),
              investedAmount: latestData.portfolio_value,
              cashBalance: latestData.cash_balance
            });
          }
          
          setGrowthData([{
            id: "Growth",
            color: tokens("dark").greenAccent[500],
            data: formatted
          }]);
        } catch (err) {
          console.error('Failed to fetch stock data:', err);
        }
      };
  
      fetchGrowthData();
    }, []);
  

  return (
    <Box>
      <Box mb={2}>
        <Typography 
          variant={"h2"} 
          fontWeight="bold" 
          color={colors.greenAccent[400]}
          mb={1}
        >
          ${portfolioStats.currentValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </Typography>
        
        <Box display="flex" gap={3} flexWrap="wrap">
          <Typography variant="body2" color={colors.grey[200]}>
            Last Updated: {portfolioStats.lastUpdate}
          </Typography>
          <Typography variant="body2" color={colors.grey[200]}>
            Invested: ${portfolioStats.investedAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Typography>
          <Typography variant="body2" color={colors.grey[200]}>
            Cash Balance: ${portfolioStats.cashBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Typography>
        </Box>
      </Box>

      <Box height={"700px"}>
        <ResponsiveLine
        data={growthData}
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
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={{ scheme: 'accent' }}
      margin={{ top: 50, right: 110, bottom: 100, left: 100 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "100",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      enableArea={true}
      areaBaselineValue={100}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 10,
        tickRotation: -60,
        legend: "Date",
        legendOffset: 80,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5,
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Value $USDT",
        legendOffset: -80,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
      </Box>
    </Box>
  );
};

export default LineChart;
