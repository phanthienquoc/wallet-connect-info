import React, { useEffect, useState } from 'react';
// import Web3 from 'web3';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography';

import Web3 from 'web3/dist/web3.min.js'; // fix bug on loading lib - https://stackoverflow.com/questions/55601669/module-not-found-error-cant-resolve-stream-in-c-dev-jszip-test-node-modul


const PolygonChainId = 137;
const ERROR_CODE_CHAIN_NOT_ADD_TO_METAMASK = 4902;//This error code indicates that the chain has not been added to MetaMask

const WalletConnect = (props) => {
    const [isConnected, setIsConnected] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        checkConnectedWallet();
    }, []);

    const checkConnectedWallet = () => {
        const userData = JSON.parse(getItemLocalStorage('userAccount'));
        if (userData != null) {
            setUserInfo(userData);
            setIsConnected(true);
        }
    }

    const detectCurrentProvider = () => {
        let provider;
        if (window.ethereum) {
            provider = window.ethereum;
        } else if (window.web3) {
            // eslint-disable-next-line
            provider = window.web3.currentProvider;
        } else {
            console.log(
                'Non-Ethereum browser detected. You should consider trying MetaMask!'
            );
        }
        return provider;
    };

    const onConnect = async () => {
        try {
            const currentProvider = detectCurrentProvider();
            if (currentProvider) {
                if (currentProvider !== window.ethereum) {
                    console.log(
                        'Non-Ethereum browser detected. You should consider trying MetaMask!'
                    );
                }
                await currentProvider.request({ method: 'eth_requestAccounts' });
                const web3 = new Web3(currentProvider);
                const userAccount = await web3.eth.getAccounts();
                const chainId = await web3.eth.getChainId();
                const account = userAccount[0];

                let ethBalance = await web3.eth.getBalance(account); // Get wallet balance
                ethBalance = web3.utils.fromWei(ethBalance, 'ether'); //Convert balance to wei
                saveUserInfo(ethBalance, account, chainId);
                if (userAccount.length === 0) {
                    console.log('Please connect to meta mask');
                }
            }
        } catch (err) {
            console.log(
                'There was an error fetching your accounts. Make sure your Ethereum client is configured correctly.'
            );
        }
    };

    const onDisconnect = () => {
        removeItemLocalStore('userAccount');
        setCookie('userAccount', null);
        setUserInfo({});
        setIsConnected(false);
    };

    const saveUserInfo = (ethBalance, account, chainId) => {
        const userAccount = {
            account: account,
            balance: ethBalance,
            connectionid: chainId,
        };
        setCookie('userAccount', JSON.stringify(userAccount));
        setItemLocalStorage('userAccount', JSON.stringify(userAccount)); //user persisted data
        const userData = JSON.parse(getItemLocalStorage('userAccount'));
        setUserInfo(userData);
        setIsConnected(true);
    };

    const getItemLocalStorage = (cname) => {
        try {
            return localStorage.getItem(cname)
        } catch (error) {
            return null
        }
    }

    const setItemLocalStorage = (cname, cvalue, exdays) => {
        window.localStorage.setItem(cname, cvalue);
    }

    const removeItemLocalStore = (cname) => {
        window.localStorage.removeItem('userAccount');
    }

    const setCookie = (cname, cvalue, exdays) => {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    const _handleChangeNetwork = async (newChain) => {
        const currentProvider = detectCurrentProvider();
        const web3 = new Web3(currentProvider);
        newChain = {
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainName: 'Polygon Mainnet',
                    chainId: web3.utils.toHex(PolygonChainId),
                    nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                    rpcUrls: ['https://polygon-rpc.com/']
                }
            ]
        }

        if (currentProvider) {
            if (currentProvider !== window.ethereum) {
                console.log(
                    'Non-Ethereum browser detected. You should consider trying MetaMask!'
                );
            } else if (window.ethereum.networkVersion !== PolygonChainId) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: web3.utils.toHex(PolygonChainId) }]
                    });
                } catch (err) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (err.code === ERROR_CODE_CHAIN_NOT_ADD_TO_METAMASK) {
                        await window.ethereum.request(newChain);
                    }
                }
            }
        }
    }

    return (
        <Box margin={"18px"} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
            <Box>
                <Typography variant='h3'>React Web3.js with</Typography>
                <ListChain />
            </Box>
            <Box >
                {!isConnected && (
                    <Box style={{
                        marginTop: 32,
                        padding: 16,
                        border: "1px solid blue",
                        borderRadius: "8px"
                    }}>                        <Button variant='contained' onClick={onConnect}>
                            Connect to MetaMask
                        </Button>
                    </Box>
                )}
            </Box>
            {isConnected && (
                <Box style={{
                    marginTop: 32,
                    padding: 16,
                    border: "1px solid blue",
                    borderRadius: "8px"
                }}>
                    <Box style={{ marginBottom: 24 }}>
                        <Box >
                            <Typography variant='h5'>Account number:</Typography>
                            {userInfo.account}
                        </Box>
                        <Box>
                            <Typography variant='h5'>Balance:</Typography>
                            {userInfo.balance}
                        </Box>
                        <Box >
                            <Typography variant='h5'>Connection ID:</Typography>
                            {userInfo.connectionid}
                        </Box>
                    </Box>
                    <Box>
                        <Button variant='outlined' style={{ marginRight: 8 }} onClick={onDisconnect}>
                            Disconnect
                        </Button>
                        <Button variant='outlined' onClick={_handleChangeNetwork}>
                            Change network to Polygon
                        </Button>
                    </Box>
                </Box>
            )
            }
        </Box >
    );
}

const ListChain = (prop) => {
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel>Mainnet</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="Network Mainnet"
                    onChange={handleChange}
                >
                    <MenuItem value={10}>Polygon</MenuItem>
                    <MenuItem value={20}>ETH</MenuItem>
                    <MenuItem value={30}>BSC</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}

export default WalletConnect;