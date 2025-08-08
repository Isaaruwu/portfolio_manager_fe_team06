import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, useTheme, IconButton, Tooltip } from "@mui/material";

import { tokens } from "../theme";
import userService from "../services/userService";
import dataService from "../services/dataService";
import RefreshIcon from "@mui/icons-material/Refresh";

const Portfolio = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);


  const fetchHoldings = async () => {
    try {
      const data = await userService.getHoldings(1);
      
      const holdingsWithPrices = await Promise.all(
        data.map(async (holding) => {
          try {
            const priceData = await dataService.getSymbolData(holding.ticker);
            return {
              ...holding,
              currentPrice: priceData.Close
            };
          } catch (error) {
            console.error(`Failed to fetch price for ${holding.ticker}:`, error);
            return {
              ...holding,
              currentPrice: 0 
            };
          }
        })
      );      
      setHoldings(holdingsWithPrices);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch holdings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchHoldings();
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchHoldings();
    };
    
    initialLoad();

    const interval = setInterval(async () => {
      await fetchHoldings();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const columns = [
    { 
      field: "ticker", 
      headerName: "Symbol",
      width: 80,
      cellClassName: "symbol-column--cell",
    },
    {
      field: "name",
      headerName: "Company Name",
      flex: 2,
      minWidth: 150,
    },
    {
      field: "asset_class",
      headerName: "Asset Class",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "quantity",
      headerName: "Shares",
      type: "number",
      width: 80,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "avg_price",
      headerName: "Avg Price",
      width: 100,
      type: "number",
      valueFormatter: ({ value }) => `$${value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "currentPrice",
      headerName: "Current",
      width: 90,
      type: "number",
      valueFormatter: ({ value }) => `$${value?.toFixed(2)}`,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "pnl_dollar",
      headerName: "P&L ($)",
      width: 100,
      type: "number",
      valueGetter: ({ row }) => {
        if (row.avg_price && row.currentPrice && row.quantity) {
          return (row.currentPrice - row.avg_price) * row.quantity;
        }
        return 0;
      },
      valueFormatter: ({ value }) => {
        const color = value >= 0 ? '#4cceac' : '#f44336';
        return `${value >= 0 ? '+' : ''}$${value?.toFixed(2)}`;
      },
      cellClassName: ({ value }) => value >= 0 ? "pnl-positive" : "pnl-negative",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "pnl_percent",
      headerName: "P&L (%)",
      width: 90,
      type: "number",
      valueGetter: ({ row }) => {
        if (row.avg_price && row.currentPrice) {
          return ((row.currentPrice - row.avg_price) / row.avg_price) * 100;
        }
        return 0;
      },
      valueFormatter: ({ value }) => `${value >= 0 ? '+' : ''}${value?.toFixed(2)}%`,
      cellClassName: ({ value }) => value >= 0 ? "pnl-positive" : "pnl-negative",
      headerAlign: "left",
      align: "left",
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" color={colors.grey[100]} fontWeight="600">
            Portfolio Holdings
          </Typography>
          {lastUpdated && (
            <Typography variant="body2" color={colors.grey[300]}>
              Auto-refresh every 10s
            </Typography>
          )}
        </Box>
        <Tooltip title="Refresh Holdings">
          <IconButton 
            onClick={handleManualRefresh}
            disabled={loading}
            sx={{ 
              color: colors.grey[100],
              '&:hover': {
                backgroundColor: colors.primary[300],
              }
            }}
          >
            <RefreshIcon sx={{ 
              animation: loading ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
            }} />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            overflow: "hidden",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .symbol-column--cell": {
            color: colors.greenAccent[300],
            fontWeight: "bold",
          },
          "& .pnl-positive": {
            color: colors.greenAccent[300],
            fontWeight: "bold",
          },
          "& .pnl-negative": {
            color: colors.redAccent[500],
            fontWeight: "bold",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
            overflowX: "hidden",
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
            <Box height="680px">
                <DataGrid 
                  rows={holdings} 
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 20]}
                  disableSelectionOnClick
                  disableColumnResize
                  autoHeight={false}
                />
            </Box>
        )}
      </Box>
    </Box>
  );
};

export default Portfolio;
