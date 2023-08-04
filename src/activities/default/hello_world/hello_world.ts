import axios, { AxiosError } from "axios";

export interface Address {
  line1: string;
  city: string;
  postcode: string;
}

export class RoyalMailRequestError extends Error {
  public errors?: any[]

  constructor(message: string, errors?: any[]) {
    super(message)
    this.name = 'RoyalMailRequestError';
  }
}

export async function createLabel(address:Address): Promise<string> {
  console.log("hello activity")
  console.log(address)
  const authUrl = "https://authentication.proshipping.net/connect/token"
  const shipmentUrl = "https://api.proshipping.net/v4/shipments/rm"
  const clientId = process.env.RM_CLIENT_ID
  const clientSecret = process.env.RM_CLIENT_SECRET
  const locationId = '181ed057-2443-47f1-b010-9f3eae5930f9'
  const accountId = '079d187f-ac9e-4d10-8c6c-016fc318e029'
  const shipmentReference = '123456'
  const authData = {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }
  const shipmentData = {
    ShipmentInformation: {
      Action: 'Process',
      ContentType: 'NDX',
      ServiceCode: 'CRL1',
      DescriptionOfGoods: 'Medicines',
      ShipmentDate: new Date(),
      CurrencyCode: 'GBP',
      WeightUnitOfMeasure: 'KG',
      DimensionsUnitOfMeasure: 'CM',
    },
    Shipper: {
      ShippingAccountId: `${accountId}`,
      ShippingLocationId: `${locationId}`,
      Reference1: `${shipmentReference}`,
    },
    Destination: {
      Address: {
        ContactName: 'John Smith',
        ContactEmail: 'john.smith@example.com',
        ContactPhone: '07123456789',
        Line1: address.line1,
        Town: address.city,
        Postcode: address.postcode,
        CountryCode: 'GB',
      },
    },
    Packages: [
      {
        PackageType: 'Parcel',
        declaredWeight: 1.5,
        declaredValue: 98.99,
        Dimensions: {
          Length: 40,
          Width: 30,
          Height: 20,
        },
      },
    ],
    Items: [
      {
        SKUCode: 'SKU123',
        Quantity: 1,
        Description: 'Jasmine',
        Value: 19.99,
        Weight: 0.5,
        HSCode: '015243',
        CountryOfOrigin: 'GB',
      },
    ],
  };
  
  try {
    const authResponse = await axios.post(authUrl, authData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    const accessToken = authResponse?.data?.access_token
    const shipmentResponse = await axios.post(shipmentUrl, shipmentData, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    })
    let result = shipmentResponse.data;
    delete result.Labels 
    console.log(result)
    return result
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const response = error.response
      const status = response.status
      if (status === 400) {
        const errors : any[] = response?.data?.Errors ?? []
        const message  = errors.length > 0 ? errors[0]?.Message : 'Unknown error'
        throw new RoyalMailRequestError(
          message,
          errors
        )
      }
    }
    throw error
  }
}

export async function uploadToNextcloud( orderId:String ): Promise<string> {
  console.log("upload to nextcloud: " + orderId)
  return `uploaded to nextcloud: ${orderId}`
}

export async function markAsNeedsAttention( orderId:String ): Promise<string> {
  console.log("needs attention: " + orderId)
  return `needs attention: ${orderId}`
}

export async function markAsFailed( orderId:String ): Promise<string> {
  console.log("failed: " + orderId)
  return `failed: ${orderId}`
}
