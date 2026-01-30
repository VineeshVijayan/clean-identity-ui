import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Package,
  Users,
  Shield,
  Clock,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  Tag,
  Lock,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

// Mock cart items
const initialCartItems = [
  {
    id: 1,
    name: "Enterprise License",
    description: "Full access to all identity management features",
    price: 999,
    quantity: 1,
    icon: Shield,
    type: "license",
    color: "primary",
  },
  {
    id: 2,
    name: "Additional Users Pack",
    description: "100 additional user licenses",
    price: 299,
    quantity: 2,
    icon: Users,
    type: "addon",
    color: "success",
  },
  {
    id: 3,
    name: "Premium Support",
    description: "24/7 priority support for 1 year",
    price: 499,
    quantity: 1,
    icon: Clock,
    type: "service",
    color: "warning",
  },
];

const steps = [
  { id: 1, name: "Cart", icon: ShoppingCart },
  { id: 2, name: "Payment", icon: CreditCard },
  { id: 3, name: "Confirm", icon: CheckCircle },
];

export const CheckoutPage = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax - discount;

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    });
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "IDENTITY20") {
      setDiscount(subtotal * 0.2);
      toast({
        title: "Promo Code Applied!",
        description: "20% discount has been applied to your order.",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "The promo code entered is invalid.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(3);
      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your purchase! You will receive a confirmation email shortly.",
      });
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">
              Review your order and complete your purchase
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep >= step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {currentStep === 3 ? (
        /* Order Confirmation */
        <motion.div variants={itemVariants}>
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your order has been successfully placed. You will receive a confirmation email with your license details shortly.
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge variant="outline" className="text-sm py-2 px-4">
                  <Truck className="h-4 w-4 mr-2" />
                  Order #ORD-2024-001
                </Badge>
              </div>
              <div className="bg-muted rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Button className="mt-6" onClick={() => setCurrentStep(1)}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Items ({cartItems.length})
                </CardTitle>
                <CardDescription>Review the items in your cart</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg bg-${item.color}/10`}>
                                  <ItemIcon className={`h-6 w-6 text-${item.color}`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                  <Badge variant="outline" className="mt-1 text-xs capitalize">
                                    {item.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, -1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="w-24 text-right">
                                  <p className="font-semibold text-foreground">${(item.price * item.quantity).toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">${item.price} each</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5 text-primary" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={applyPromoCode}>
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Try "IDENTITY20" for 20% off
                </p>
              </CardContent>
            </Card>

            {/* Payment Method - Show on step 2 */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={paymentInfo.expiry}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Cardholder Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={paymentInfo.name}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount (20%)</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                {currentStep === 1 ? (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => setCurrentStep(2)}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Payment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0 || isProcessing}
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Complete Purchase
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Cart
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>

            {/* Secure Checkout Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
              <Lock className="h-4 w-4 text-success" />
              <span>Secure 256-bit SSL encryption</span>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Shield className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-center text-muted-foreground">Secure</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-center text-muted-foreground">24/7 Support</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-center text-muted-foreground">Guaranteed</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
