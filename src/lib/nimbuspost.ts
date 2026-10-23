export interface NimbusPostShipmentInput {
  order_number: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  pickup_address: string;
  delivery_address: {
    name: string;
    phone: string;
    email: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  payment_mode: 'prepaid' | 'cod';
  order_amount: number;
}

export const nimbuspost = {
  /**
   * Register a new shipment with NimbusPost
   */
  async createShipment(input: NimbusPostShipmentInput) {
    const apiKey = process.env.NIMBUSPOST_API_KEY;
    
    // In local testing / mock mode where the API key is a placeholder:
    if (!apiKey || apiKey.startsWith('nimbus_placeholder')) {
      console.log('NimbusPost: Running in MOCK Mode. Generating dummy AWB.');
      return {
        status: true,
        data: {
          awb: `AWB${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          courier_name: 'Nimbus Express (Mock)'
        }
      };
    }

    try {
      const response = await fetch('https://api.nimbuspost.com/v1/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          order_number: input.order_number,
          weight: input.weight,
          dimensions: `${input.length}x${input.width}x${input.height}`,
          pickup_address: input.pickup_address,
          delivery_address: input.delivery_address,
          payment_mode: input.payment_mode,
          order_amount: input.order_amount,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NimbusPost responded with status ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('NimbusPost Create Shipment API Error:', error);
      throw new Error('Failed to create shipment on NimbusPost. Please check server logs.');
    }
  },

  /**
   * Fetch tracking logs for a specific AWB number from NimbusPost (cached for 5 minutes)
   */
  async trackShipment(awb: string) {
    const apiKey = process.env.NIMBUSPOST_API_KEY;

    if (!apiKey || apiKey.startsWith('nimbus_placeholder')) {
      console.log(`NimbusPost: Running track in MOCK Mode for AWB: ${awb}`);
      return {
        status: true,
        data: {
          awb,
          history: [
            { status: 'Manifested', activity: 'Shipment registered successfully', location: 'Bengaluru Hub', event_time: new Date().toISOString() },
            { status: 'Picked Up', activity: 'Package collected by courier executive', location: 'Yelahanka Hub', event_time: new Date(Date.now() - 3600000).toISOString() }
          ]
        }
      };
    }

    try {
      // Use Next.js revalidate option to cache the fetch result for 5 minutes (300 seconds)
      const response = await fetch(`https://api.nimbuspost.com/v1/shipments/track/${awb}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        next: {
          revalidate: 300
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NimbusPost tracking responded with status ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`NimbusPost Track Shipment API Error for AWB ${awb}:`, error);
      throw new Error('Failed to fetch tracking details. Please check server logs.');
    }
  }
};
