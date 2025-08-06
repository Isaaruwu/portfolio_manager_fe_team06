import { Box, IconButton, useTheme, Menu, MenuItem, TextField, Button, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import userService from "../../services/userService";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const open = Boolean(anchorEl);

  const handleDepositClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDepositClose = () => {
    setAnchorEl(null);
    setDepositAmount('');
  };

  const handleDepositSubmit = async () => {
    if (depositAmount && parseFloat(depositAmount) > 0) {
      await userService.deposit(1, parseFloat(depositAmount));
      console.log('Depositing:', depositAmount);
      handleDepositClose();
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      />
    
      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton onClick={handleDepositClick}>
          <AttachMoneyIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleDepositClose}
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[600],
            border: `1px solid ${colors.grey[600]}`,
            minWidth: 250,
            p: 2
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="h6" 
            color={colors.grey[100]} 
            fontWeight="bold" 
            mb={2}
          >
            Deposit Funds
          </Typography>
          
          <TextField
            fullWidth
            label="Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            type="number"
            placeholder="Enter amount to deposit"
            InputProps={{
              sx: { 
                color: colors.grey[100],
                '& input': { color: colors.grey[100] }
              }
            }}
            InputLabelProps={{ 
              sx: { color: colors.grey[300] } 
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: colors.grey[600] },
                '&:hover fieldset': { borderColor: colors.grey[500] },
                '&.Mui-focused fieldset': { borderColor: colors.primary[200] },
              }
            }}
          />
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={handleDepositClose}
              sx={{
                color: colors.grey[100],
                borderColor: colors.grey[600],
                '&:hover': {
                  borderColor: colors.grey[500],
                  backgroundColor: colors.grey[800]
                }
              }}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              onClick={handleDepositSubmit}
              disabled={!depositAmount || parseFloat(depositAmount) <= 0}
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                '&:hover': {
                  backgroundColor: colors.greenAccent[700],
                },
                '&:disabled': {
                  backgroundColor: colors.grey[600],
                  color: colors.grey[400],
                }
              }}
            >
              Deposit
            </Button>
          </Box>
        </Box>
      </Menu>
    </Box>
  );
};

export default Topbar;
