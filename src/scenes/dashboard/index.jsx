import { Box, Typography, useTheme, Button, Snackbar, Alert } from "@mui/material";
import { tokens } from "../../theme";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Header from "../../components/Header";
import Portfolio from "../../components/Portfolio";
import StatBox from "../../components/StatBox";
import Order from "../../components/Order";

import userService from "../../services/userService";
import { useState, useEffect } from "react";

const Dashboard = ({ refreshKey: externalRefreshKey = 0 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [transactions, setTransactions] = useState([]);
  const [unrealizedGain, setUnrealizedGain] = useState(null);
  const [realizedGain, setRealizedGain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [balance, setBalance] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const handleOrderClose = (orderSubmitted = false) => {
    setOrderModalOpen(false);
    setRefreshKey(prev => prev + 1);
    if (orderSubmitted) {
      setShowOrderSuccess(true);
    }
  };

  const handleSuccessClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowOrderSuccess(false);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await userService.getTransactions(1);
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setTransactions(sortedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUnrealizedGains = async () => {
      try {
        const gain = await userService.getUnrealizedGains(1); 
        setUnrealizedGain(gain);
      } catch (err) {
        console.error("Failed to fetch unrealized gains:", err);
        setUnrealizedGain(null);
      }
    };

    const fetchRealizedGains = async () => {
      try {
        const gain = await userService.getRealizedGains(1); 
        setRealizedGain(gain);
      } catch (err) {
        console.error("Failed to fetch realized gains:", err);
        setRealizedGain(null);
      }
    };
    fetchRealizedGains();
  
    fetchUnrealizedGains();
    fetchTransactions();
  }, [refreshKey, externalRefreshKey]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await userService.getBalance(1);
        setBalance(data);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    fetchBalance();
  }, [refreshKey, externalRefreshKey]);

return (
  <Box m="20px">
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
    </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="20px"
        mb="40px"
        height="50px"
      >
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Unrealized Gains"
            subtitle=""
            progress={unrealizedGain !== null ? (unrealizedGain / 100).toFixed(2) : 0}
            increase={unrealizedGain !== null ? `${unrealizedGain.toFixed(2)}%` : "N/A"}
            icon={<TimelineOutlinedIcon />}
          />
        </Box>

        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Realized Gains"
            subtitle=""
            progress={realizedGain !== null ? (realizedGain / 100).toFixed(2) : 0}
            increase={realizedGain !== null ? `${realizedGain.toFixed(2)}%` : "N/A"}
            icon={<TimelineOutlinedIcon />}
          />
        </Box>
        
        <Box
        gridColumn="span 3"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <StatBox
          title={balance != null ? `$${balance.toLocaleString()}` : "Loading..."}
          subtitle="User Balance"
          progress="0.80"
          icon={
            <AccountBalanceIcon
              sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
            />
          }
        />
      </Box>

        <Box
          gridColumn="span 3"
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
              setOrderModalOpen(true);
            }}
          >
            Place Order
          </Button>
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        <Box
          gridColumn="span 8"
          gridRow="span 5"
          backgroundColor={colors.primary[400]}
        >
          <Box m="20px 0 0 0">
            <Portfolio key={refreshKey} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 5"
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
                    backgroundColor={colors.greenAccent[500]}
                    p="5px 10px"
                    borderRadius="4px"
                  >
                    ${transaction.price}
                  </Box> 
                ) : (
                  <Box
                    backgroundColor={colors.redAccent[500]}
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
      </Box>

      {orderModalOpen && (
        <Order
          open={orderModalOpen}
          onClose={handleOrderClose}
        />
      )}

      <Snackbar
        open={showOrderSuccess}
        autoHideDuration={4000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={handleSuccessClose} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: colors.greenAccent[600],
            color: colors.grey[100],
            '& .MuiAlert-icon': {
              color: colors.grey[100]
            },
            '& .MuiAlert-action': {
              color: colors.grey[100]
            }
          }}
        >
          Order placed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;