import { useState, useEffect } from 'react';
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Paper,
  Divider,
  useTheme,
  InputAdornment,
  Alert,
  Modal,
  Backdrop,
  InputBase,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Fade
} from '@mui/material';

import { tokens } from "../theme";
import dataService from "../services/dataService";
import userService from "../services/userService";
import transactionService from "../services/transactionService";


const Order = ({ open, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [balance, setCurrentBalance] = useState(0);
  const [holdingQty, setholdingQty] = useState(0);
  const [tradeType, setTradeType] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [popularStocks, setPopularStocks] = useState([]);

  useEffect(() => {
    const fetchAvailableStocks = async () => {
      try {
        const stockData = await dataService.getAllData();

        const stocks = stockData.map(data => ({
          symbol: data.ticker,
          name: data.name
        }));
        
        setAvailableStocks(stocks);
        setPopularStocks(stocks.slice(0, 3));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stock data:', err);
      }
    };

    fetchAvailableStocks();
  }, []);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const priceData = await dataService.getSymbolData(selectedSymbol);
        const fetchedPrice = priceData.Close.toFixed(2);
        setCurrentPrice(fetchedPrice);
        
        if (orderType === 'market') {
          setPrice(fetchedPrice.toString());
          if (quantity) {
            setTotal((parseFloat(quantity) * parseFloat(fetchedPrice)).toFixed(2));
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch current price:', err);
        setError(err.message);
      }
    };

    if (selectedSymbol) {
      fetchCurrentPrice();
    }
  }, [selectedSymbol, orderType, quantity]);


  useEffect(() => {
    const fetchCurrentBalance = async () => {
      try {
        const balance = await userService.getBalance(1);
        setCurrentBalance(balance); 
        setError(null);
      } catch (err) {
        console.error('Failed to fetch current balance:', err);
        setError(err.message);
      }
    };

    fetchCurrentBalance();
  }, []);

  useEffect(() => {
    const fetchHoldingQty = async () => {
      try {
        const holdings = await userService.getHoldings(1);
        setholdingQty(holdings.find(h => h.ticker.toLowerCase() === selectedSymbol.toLowerCase())?.quantity || 0); 
        setError(null);
      } catch (err) {
        console.error('Failed to fetch current holdings:', err);
        setError(err.message);
      }
    };

    if (selectedSymbol) {
      fetchHoldingQty();
    }
  }, [selectedSymbol]);


  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue.length > 0) {
      const filtered = availableStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleStockSelect = (stockSymbol) => {
    setSelectedSymbol(stockSymbol);
    setShowSearch(false);
    setSearchTerm('');
    setSearchResults([]);
    setQuantity('');
    setPrice('');
    setTotal(0);
    setError('');
  };


  const handleTradeTypeChange = (type) => {
    setTradeType(type);
    setError('');
  };


  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type === 'market') {
      setPrice(currentPrice.toString());
      if (quantity) {
        setTotal((parseFloat(quantity) * parseFloat(currentPrice)).toFixed(2));
      }
    } else {
      setPrice('');
      setTotal(0);
    }
  };


  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    
    if (value && price) {
      setTotal((parseFloat(value) * parseFloat(price)).toFixed(2));
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);
    
    if (value && quantity) {
      const newTotal = (parseFloat(quantity) * parseFloat(value)).toFixed(2);
      setTotal(newTotal);
      
      if (tradeType === 'buy' && newTotal > 0 && (balance - parseFloat(newTotal)) < 0) {
        setError(`Insufficient balance. You need $${parseFloat(newTotal - balance).toLocaleString()} more USDT.`);
      } 
      else if (tradeType === 'buy' && newTotal > 0 && (balance - parseFloat(newTotal)) >= 0) {
        if (error && error.includes('Insufficient balance')) {
          setError('');
        }
      }
    }
  };

  const validateTrade = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }
    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setError('Please enter a valid price');
      return false;
    }
    if (tradeType === 'sell' && parseFloat(quantity) > holdingQty) {
      setError(`Insufficient holdings. You only have ${holdingQty.toLocaleString()} ${selectedSymbol} available.`);
      return false;
    }
    if (tradeType === 'buy' && total > 0 && (balance - parseFloat(total)) < 0) {
      setError(`Insufficient balance. You need $${parseFloat(total - balance).toLocaleString()} more USDT.`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateTrade()) return;

    const tradeData = {
      user_id: 1,
      ticker: selectedSymbol,
      orderType: orderType,
      quantity: tradeType === 'sell' ? -Math.abs(quantity): parseFloat(quantity),
      price: orderType === 'limit' ? parseFloat(price) : parseFloat(currentPrice),
      timestamp: new Date().toISOString().replace('Z', '+00:00'),
    };

    const orderSentSuccessfully = await transactionService.newTransaction(tradeData);    

    if (orderSentSuccessfully) {
      setQuantity('');
      setPrice(orderType === 'market' ? currentPrice.toString() : '');
      setTotal(0);
      
      if (onClose) {
        onClose(true);
      }
      
    } else {
      setError('Failed to send order. Please check connection and try again.');
    }
  };

  const handleModalClose = () => {
    if (onClose) {
      onClose(false);
    }
  };

  return (
      <Modal
        aria-labelledby="trade-results-modal"
        aria-describedby="trade-results-description"
        open={open}
        onClose={handleModalClose}
        closeAfterTransition 
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Paper 
                elevation={3}
                sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    maxHeight: '90vh',
                    overflow: 'auto',
                    p: 3, 
                    backgroundColor: colors.primary[400],
                    borderRadius: 2
                }}
                >
                {showSearch ? (
                  <>
                    <Typography variant="h5" fontWeight="bold" mb={2} color={colors.grey[100]}>
                        Select Stock to Trade
                    </Typography>
                    
                    <Box
                        display="flex"
                        backgroundColor={colors.primary[500]}
                        borderRadius="3px"
                        marginBottom={2}
                    >
                        <InputBase 
                            sx={{ ml: 2, flex: 1, color: colors.grey[100] }} 
                            placeholder="Search stocks (e.g., Bitcoin, BTC)" 
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <IconButton type="button" sx={{ p: 1, color: colors.grey[100] }}>
                            <SearchIcon />
                        </IconButton>
                    </Box>

                    {searchResults.length > 0 && (
                        <Box mb={2} sx={{ maxHeight: '300px', overflow: 'auto', '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            <List>
                                {searchResults.map((stock) => (
                                    <ListItem
                                        key={stock.symbol}
                                        button
                                        onClick={() => handleStockSelect(stock.symbol)}
                                        sx={{
                                            backgroundColor: colors.primary[500],
                                            mb: 1,
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: colors.primary[300],
                                            }
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography color={colors.grey[100]} fontWeight="600">
                                                    {stock.symbol}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography color={colors.grey[300]}>
                                                    {stock.name}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {searchTerm === '' && (
                        <Box sx={{ maxHeight: '300px', overflow: 'auto', '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            <Typography variant="h6" color={colors.grey[200]} mb={1}>
                                Popular Stocks
                            </Typography>
                            <List>
                                {popularStocks.map((stock) => (
                                    <ListItem
                                        key={stock.symbol}
                                        button
                                        onClick={() => handleStockSelect(stock.symbol)}
                                        sx={{
                                            backgroundColor: colors.primary[500],
                                            mb: 1,
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: colors.primary[300],
                                            }
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography color={colors.grey[100]} fontWeight="600">
                                                    {stock.symbol}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography color={colors.grey[300]}>
                                                    {stock.name}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                  </>
                ) : selectedSymbol ? (
                  <>
                    <Box display="flex" alignItems="center" mb={2}>
                        <IconButton 
                            onClick={() => setShowSearch(true)}
                            sx={{ color: colors.grey[100], mr: 1 }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5" fontWeight="bold" color={colors.grey[100]}>
                            Trade {selectedSymbol.toUpperCase()}
                        </Typography>
                    </Box>
                

                <Box mb={2}>
                    <Typography variant="body2" color={colors.grey[300]}>
                    Estimated Current Price
                    </Typography>
                    <Typography variant="h6" color={colors.greenAccent[400]}>
                    ${currentPrice.toLocaleString()}
                    </Typography>
                </Box>

                <Box mb={3}>
                    <ButtonGroup fullWidth variant="contained" sx={{ mb: 2 }}>
                    <Button
                        onClick={() => handleTradeTypeChange('buy')}
                        sx={{
                        backgroundColor: tradeType === 'buy' ? colors.greenAccent[600] : colors.grey[700],
                        color: colors.grey[100],
                        '&:hover': {
                            backgroundColor: tradeType === 'buy' ? colors.greenAccent[700] : colors.grey[600],
                        }
                        }}
                    >
                        Buy
                    </Button>
                    <Button
                        onClick={() => handleTradeTypeChange('sell')}
                        sx={{
                        backgroundColor: tradeType === 'sell' ? colors.redAccent[600] : colors.grey[700],
                        color: colors.grey[100],
                        '&:hover': {
                            backgroundColor: tradeType === 'sell' ? colors.redAccent[700] : colors.grey[600],
                        }
                        }}
                    >
                        Sell
                    </Button>
                    </ButtonGroup>
                </Box>

                <TextField
                    fullWidth
                    label="Quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    type="number"
                    InputProps={{
                    endAdornment: <InputAdornment position="end">{selectedSymbol}</InputAdornment>,
                    sx: { color: colors.grey[100] }
                    }}
                    InputLabelProps={{ sx: { color: colors.grey[300] } }}
                    sx={{ 
                    mb: tradeType === 'sell' ? 1 : 2,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.grey[600] },
                        '&:hover fieldset': { borderColor: colors.grey[500] },
                        '&.Mui-focused fieldset': { borderColor: colors.primary[200] },
                    }
                    }}
                />

                {tradeType === 'sell' && (
                    <Box mb={2}>
                        <Typography variant="body2" color={quantity > parseFloat(holdingQty) ? colors.redAccent[300] : colors.grey[300]}>
                            Current Holdings: {holdingQty.toLocaleString()}
                        </Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2, backgroundColor: colors.redAccent[800] }}>
                    {error}
                    </Alert>
                )}

                <Divider sx={{ mb: 2, backgroundColor: colors.grey[600] }} />

                <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    p={1}
                    mb={2}
                >
                    <Typography variant="h6" color={colors.grey[100]} fontWeight="600">
                        Total:
                    </Typography>
                    <Typography variant="h6" color={colors.greenAccent[400]} fontWeight="bold">
                        ${total ? parseFloat(total).toLocaleString() : '0.00'} USDT
                    </Typography>
                </Box>

                <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    p={1}
                    mb={2}
                >
                    <Typography variant="h6" color={colors.grey[100]} fontWeight="600">
                        Available Balance:
                    </Typography>
                    <Typography 
                        variant="h6" 
                        color={
                            total > 0 && tradeType === 'buy' && (balance - parseFloat(total)) < 0 
                                ? colors.redAccent[400] 
                                : colors.greenAccent[400]
                        } 
                        fontWeight="bold"
                    >
                        ${total > 0 
                            ? parseFloat(
                                tradeType === 'buy' 
                                    ? balance - parseFloat(total)
                                    : balance + parseFloat(total)
                              ).toLocaleString() 
                            : parseFloat(balance).toLocaleString()
                        } USDT
                    </Typography>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={
                        (tradeType === 'buy' && 
                        total > 0 && 
                        (balance - parseFloat(total)) < 0) ||
                        (tradeType === 'sell' && 
                        quantity && 
                        parseFloat(quantity) > holdingQty)
                    }
                    sx={{
                    backgroundColor: tradeType === 'buy' ? colors.greenAccent[600] : colors.redAccent[600],
                    color: colors.grey[100],
                    fontWeight: 'bold',
                    py: 1.5,
                    opacity: (
                        (tradeType === 'buy' && total > 0 && (balance - parseFloat(total)) < 0) ||
                        (tradeType === 'sell' && quantity && parseFloat(quantity) > holdingQty)
                    ) ? 0.5 : 1,
                    '&:hover': {
                        backgroundColor: tradeType === 'buy' ? colors.greenAccent[700] : colors.redAccent[700],
                    },
                    '&:disabled': {
                        backgroundColor: colors.grey[600],
                        color: colors.grey[400],
                    }
                    }}
                >
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedSymbol}
                </Button>
                  </>
                ) : (
                  <Typography variant="h6" color={colors.grey[300]} textAlign="center" p={4}>
                    Please select a stock to start trading
                  </Typography>
                )}
            </Paper>
        </Fade>
      </Modal>
  );
};

export default Order;
