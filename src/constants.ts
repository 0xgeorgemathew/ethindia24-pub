export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const mintContractAddress = "0xF851b2Ec188Fb1D729a8355d59a312890E0364fe";
export const mintABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "adId", type: "uint256" },
      {
        indexed: true,
        internalType: "address",
        name: "publisher",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "imageIpfsUrl",
        type: "string",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "AdPublished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "adId", type: "uint256" },
      {
        indexed: true,
        internalType: "address",
        name: "publisher",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "isActive", type: "bool" },
    ],
    name: "AdStatusChanged",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "ads",
    outputs: [
      { internalType: "address", name: "publisher", type: "address" },
      { internalType: "string", name: "imageIpfsUrl", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "text", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_adId", type: "uint256" }],
    name: "getAd",
    outputs: [
      { internalType: "address", name: "publisher", type: "address" },
      { internalType: "string", name: "imageIpfsUrl", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "text", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllAds",
    outputs: [
      {
        components: [
          { internalType: "address", name: "publisher", type: "address" },
          { internalType: "string", name: "imageIpfsUrl", type: "string" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "text", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct PlaceHolderAds.Ad[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_publisher", type: "address" }],
    name: "getPublisherAds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_imageIpfsUrl", type: "string" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_text", type: "string" },
    ],
    name: "publishAd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "publisherAds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_adId", type: "uint256" }],
    name: "toggleAdStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
