import { Box, Typography } from "@mui/material";

import Header from "../../components/Header";
import PieChart from "../../components/PieChart";
import AssetPieChart from "../../components/AssetPieChart";

const Pie = () => {
  return (
    <Box m="20px">
      <Header title="Asset Allocation" />
      <Box display="flex" gap="20px" height="75vh">
        <Box flex={1}>
          <Typography variant="h4" mb="10px" textAlign="center">
            Allocation by Asset Type
          </Typography>
          <PieChart />
        </Box>
        <Box flex={1}>
          <Typography variant="h4" mb="10px" textAlign="center">
            Allocation by Individual Asset
          </Typography>
          <AssetPieChart />
        </Box>
      </Box>
    </Box>
  );
};

export default Pie;
