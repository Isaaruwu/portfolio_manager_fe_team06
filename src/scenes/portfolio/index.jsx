import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import userService from "../../services/userService";
import Header from "../../components/Header";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

const Portfolio = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data as fallback
  const mockHoldings = [
    {
      id: 1,
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 100,
      currentPrice: 175.50,
      totalValue: 17550.00,
      purchasePrice: 150.00,
      gainLoss: 2550.00,
      gainLossPercent: 17.00,
      sector: "Technology"
    },
    {
      id: 2,
      symbol: "MSFT",
      name: "Microsoft Corporation",
      shares: 50,
      currentPrice: 420.30,
      totalValue: 21015.00,
      purchasePrice: 380.00,
      gainLoss: 2015.00,
      gainLossPercent: 10.61,
      sector: "Technology"
    },
    {
      id: 3,
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 25,
      currentPrice: 2850.75,
      totalValue: 71268.75,
      purchasePrice: 2950.00,
      gainLoss: -2481.25,
      gainLossPercent: -3.37,
      sector: "Technology"
    },
    {
      id: 4,
      symbol: "TSLA",
      name: "Tesla Inc.",
      shares: 75,
      currentPrice: 245.80,
      totalValue: 18435.00,
      purchasePrice: 220.00,
      gainLoss: 1935.00,
      gainLossPercent: 11.73,
      sector: "Automotive"
    },
    {
      id: 5,
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      shares: 30,
      currentPrice: 875.25,
      totalValue: 26257.50,
      purchasePrice: 650.00,
      gainLoss: 6757.50,
      gainLossPercent: 34.68,
      sector: "Technology"
    }
  ];

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        const data = await userService.getHoldings(1); // Using userid=1
        setHoldings(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch holdings:', err);
        setError(err.message);
        // Fallback to mock data if API fails
        setHoldings(mockHoldings);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  const columns = [
    { 
      field: "symbol", 
      headerName: "Symbol",
      width: 100,
      cellClassName: "symbol-column--cell",
    },
    {
      field: "name",
      headerName: "Company Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "shares",
      headerName: "Shares",
      type: "number",
      width: 100,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "currentPrice",
      headerName: "Current Price",
      width: 120,
      type: "number",
      valueFormatter: ({ value }) => `$${value?.toFixed(2)}`,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "totalValue",
      headerName: "Total Value",
      width: 130,
      type: "number",
      valueFormatter: ({ value }) => `$${value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "gainLoss",
      headerName: "Gain/Loss",
      width: 120,
      type: "number",
      valueFormatter: ({ value }) => `$${value?.toFixed(2)}`,
      headerAlign: "left",
      align: "left",
      renderCell: ({ row: { gainLoss } }) => {
        return (
          <Box
            display="flex"
            alignItems="center"
            color={
              gainLoss > 0
                ? colors.greenAccent[400]
                : gainLoss < 0
                ? colors.redAccent[400]
                : colors.grey[100]
            }
          >
            {gainLoss > 0 && <TrendingUpIcon sx={{ mr: "5px", fontSize: "16px" }} />}
            {gainLoss < 0 && <TrendingDownIcon sx={{ mr: "5px", fontSize: "16px" }} />}
            {gainLoss === 0 && <TrendingFlatIcon sx={{ mr: "5px", fontSize: "16px" }} />}
            <Typography>
              ${gainLoss?.toFixed(2)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "gainLossPercent",
      headerName: "Gain/Loss %",
      width: 130,
      type: "number",
      headerAlign: "left",
      align: "left",
      renderCell: ({ row: { gainLossPercent } }) => {
        return (
          <Box
            width="80%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            backgroundColor={
              gainLossPercent > 0
                ? colors.greenAccent[600]
                : gainLossPercent < 0
                ? colors.redAccent[600]
                : colors.grey[600]
            }
            borderRadius="4px"
          >
            <Typography color={colors.grey[100]} sx={{ fontWeight: "bold" }}>
              {gainLossPercent > 0 ? "+" : ""}{gainLossPercent?.toFixed(2)}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "sector",
      headerName: "Sector",
      width: 120,
      renderCell: ({ row: { sector } }) => {
        return (
          <Box
            width="90%"
            m="0 auto"
            p="3px 8px"
            display="flex"
            justifyContent="center"
            backgroundColor={colors.blueAccent[600]}
            borderRadius="4px"
          >
            <Typography color={colors.grey[100]} sx={{ fontSize: "12px" }}>
              {sector}
            </Typography>
          </Box>
        );
      },
    },
  ];

  // Calculate portfolio summary
  const portfolioSummary = holdings.reduce(
    (acc, holding) => {
      acc.totalValue += holding.totalValue || 0;
      acc.totalGainLoss += holding.gainLoss || 0;
      return acc;
    },
    { totalValue: 0, totalGainLoss: 0 }
  );

  const totalGainLossPercent = portfolioSummary.totalValue > 0 
    ? (portfolioSummary.totalGainLoss / (portfolioSummary.totalValue - portfolioSummary.totalGainLoss)) * 100 
    : 0;

  return (
    <Box m="20px">
      <Header title="PORTFOLIO" subtitle="Managing Investment Holdings" />
      
      {/* Portfolio Summary */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap="20px"
        mb="30px"
      >
        <Box
          backgroundColor={colors.primary[400]}
          p="20px"
          borderRadius="8px"
          textAlign="center"
        >
          <Typography variant="h6" color={colors.grey[100]}>
            Total Portfolio Value
          </Typography>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            color={colors.greenAccent[500]}
            mt="10px"
          >
            ${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>
        
        <Box
          backgroundColor={colors.primary[400]}
          p="20px"
          borderRadius="8px"
          textAlign="center"
        >
          <Typography variant="h6" color={colors.grey[100]}>
            Total Gain/Loss
          </Typography>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            color={portfolioSummary.totalGainLoss >= 0 ? colors.greenAccent[500] : colors.redAccent[500]}
            mt="10px"
          >
            ${portfolioSummary.totalGainLoss.toFixed(2)}
          </Typography>
        </Box>
        
        <Box
          backgroundColor={colors.primary[400]}
          p="20px"
          borderRadius="8px"
          textAlign="center"
        >
          <Typography variant="h6" color={colors.grey[100]}>
            Total Return %
          </Typography>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            color={totalGainLossPercent >= 0 ? colors.greenAccent[500] : colors.redAccent[500]}
            mt="10px"
          >
            {totalGainLossPercent >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(2)}%
          </Typography>
        </Box>
      </Box>

      {/* Holdings DataGrid */}
      <Box
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .symbol-column--cell": {
            color: colors.greenAccent[300],
            fontWeight: "bold",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        {loading ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
            backgroundColor={colors.primary[400]}
          >
            <Typography color={colors.grey[100]} variant="h4">
              Loading portfolio holdings...
            </Typography>
          </Box>
        ) : error && holdings.length === 0 ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
            backgroundColor={colors.primary[400]}
          >
            <Typography color={colors.redAccent[500]} variant="h4">
              Failed to load holdings: {error}
            </Typography>
          </Box>
        ) : (
          <DataGrid 
            checkboxSelection 
            rows={holdings} 
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
          />
        )}
      </Box>
    </Box>
  );
};

export default Portfolio;
