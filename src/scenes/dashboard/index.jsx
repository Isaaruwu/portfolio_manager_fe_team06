import { Box, Typography, useTheme, Button } from "@mui/material";
import { tokens } from "../../theme";
import TrafficIcon from "@mui/icons-material/Traffic";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Header from "../../components/Header";
import Portfolio from "../../components/Portfolio";
import StatBox from "../../components/StatBox";

import ProgressCircle from "../../components/ProgressCircle";
import userService from "../../services/userService";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await userService.getTransactions(1);
        setTransactions(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Unrealized Gains"
            subtitle=""
            progress="0.75"
            increase="+14%"
            icon={<TimelineOutlinedIcon />}
          />
        </Box>
        
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="1,325,134"
            subtitle="Traffic Received"
            progress="0.80"
            increase="+43%"
            icon={
              <TrafficIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 6"
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          p="20px"
        >
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              "&:hover": {
                backgroundColor: colors.greenAccent[700],
              },
            }}
            onClick={() => {
              // Add your order logic here
              console.log("Order button clicked");
            }}
          >
            Place Order
          </Button>
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 4"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.grey[100]}
              >
                Holdings
              </Typography>
            </Box>
          </Box>
          <Box m="20px 0 0 0">
            <Portfolio />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 3"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>
          {loading ? (
            <Box p="15px">
              <Typography color={colors.grey[100]}>Loading transactions...</Typography>
            </Box>
          ) : error && transactions.length === 0 ? (
            <Box p="15px">
              <Typography color={colors.redAccent[500]}>
                Failed to load transactions: {error}
              </Typography>
            </Box>
          ) : (
            transactions.map((transaction) => (
              <Box
                key={`${transaction.id}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box>
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"
                    fontWeight="600"
                  >
                    {transaction.ticker}
                  </Typography>
                </Box>
                <Box color={colors.grey[100]}>{transaction.timestamp}</Box>
                <Box color={colors.grey[100]}>{transaction.quantity}</Box>
                {transaction.quantity < 0 ? (
                  <Box
                    backgroundColor={colors.redAccent[500]}
                    p="5px 10px"
                    borderRadius="4px"
                  >
                    ${transaction.price}
                  </Box> 
                ) : (
                  <Box
                    backgroundColor={colors.greenAccent[500]}
                    p="5px 10px"
                    borderRadius="4px"
                  >
                    ${transaction.price}
                  </Box> 
                )}
              </Box>
            ))
          )}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              $48,352 revenue generated
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
