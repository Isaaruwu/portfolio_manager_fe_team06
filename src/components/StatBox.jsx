import { Box, Typography, useTheme } from "@mui/material";

import { tokens } from "../theme";


const StatBox = ({ title, icon, increase }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%">
      <Box display="flex" justifyContent="center" alignItems="center" gap="35px">
        <Box>
          {icon}
        </Box>
        <Box display="flex" alignItems="center" gap="10px">
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: colors.grey[100] }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            fontStyle="italic"
            sx={{ color: increase < 0 ? colors.redAccent[500] : colors.greenAccent[600] }}
          >
            {increase} {increase ? '%' : ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StatBox;
