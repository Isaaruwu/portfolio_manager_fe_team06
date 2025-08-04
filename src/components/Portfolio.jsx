import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import { useState, useEffect } from "react";
import userService from "../services/userService";

const Portfolio = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        const data = await userService.getHoldings(1);
        const currentPrices = await userService.getHoldingsPrices(1);
        const holdingsWithPrices = data.map(holding => ({
            ...holding,
            currentPrice: currentPrices[holding.ticker],
        }));
        setHoldings(holdingsWithPrices);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch holdings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  const columns = [
    { 
      field: "ticker", 
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
      field: "quantity",
      headerName: "Shares",
      type: "number",
      width: 100,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "avg_price",
      headerName: "Average Price",
      width: 130,
      type: "number",
      valueFormatter: ({ value }) => `$${value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
  ];

  return (
    <Box m="20px">
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
            <Box height="500px">
                <DataGrid 
                  rows={holdings} 
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 20]}
                  disableSelectionOnClick
                />
            </Box>
        )}
      </Box>
    </Box>
  );
};

export default Portfolio;
