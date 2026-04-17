/**
 * Razorpay Checkout Integration (Test Mode)
 * This service handles the dynamic loading of the Razorpay script
 * and manages the checkout flow for unlocking Pro features.
 */

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateProCheckout = async (onSuccess: () => void) => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    alert("SYSTEM FAILURE: Unable to connect to Payment Gateway. Check Network Connection.");
    return;
  }

  const options = {
    key: "rzp_test_placeholder", // Replace with your actual Test Key
    amount: 99900, // INR 999 in paise
    currency: "INR",
    name: "FaceToCode Pro",
    description: "Lifetime HD Export & Neural Intelligence Access",
    image: "https://raw.githubusercontent.com/lucide-react/icons/main/icons/terminal.svg",
    handler: function (response: any) {
      console.log("Payment Successful:", response.razorpay_payment_id);
      // In a real app, you would verify this on the backend
      onSuccess();
    },
    prefill: {
      name: "Cyber Citizen",
      email: "citizen@cyber.net",
    },
    notes: {
      address: "Neuralink District 9",
    },
    theme: {
      color: "#00FF41",
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
