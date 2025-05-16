import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import SendMoney from "@/pages/dashboard/send-money";
import LinkAccounts from "@/pages/dashboard/link-accounts";
import Investments from "@/pages/dashboard/investments";
import InternationalTransfer from "@/pages/dashboard/international-transfer";
import InstantTransfer from "@/pages/dashboard/instant-transfer";
import TapToPay from "@/pages/dashboard/tap-to-pay";
import ExternalTransfer from "@/pages/transfers/external-transfer";
import VenmoTransfer from "@/pages/transfers/venmo-transfer";
import TransfersIndex from "@/pages/transfers/index";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/courses/[courseId]";
import Achievements from "@/pages/courses/achievements";
import VirtualCards from "@/pages/cards";
import CardDetail from "@/pages/cards/[id]";
import LandingPage from "@/pages/landing";
import RevenueDashboard from "@/pages/admin/revenue-dashboard";
import MobileTapToPayPage from "@/pages/mobile/tap-to-pay";
import BitcoinTrading from "@/pages/crypto/bitcoin-trading";
import BitcoinTapToPay from "@/pages/crypto/bitcoin-tap-to-pay";
import { AuthProvider, AuthContext } from "@/contexts/auth-context";
import { PremiumUpsellProvider } from "@/contexts/premium-upsell-context";
import { useContext } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/send-money" component={SendMoney} />
      <Route path="/dashboard/link-accounts" component={LinkAccounts} />
      <Route path="/dashboard/investments" component={Investments} />
      <Route path="/dashboard/international-transfer" component={InternationalTransfer} />
      <Route path="/dashboard/instant-transfer" component={InstantTransfer} />
      <Route path="/dashboard/tap-to-pay" component={TapToPay} />
      <Route path="/transfers" component={TransfersIndex} />
      <Route path="/transfers/external-transfer" component={ExternalTransfer} />
      <Route path="/transfers/venmo-transfer" component={VenmoTransfer} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/achievements" component={Achievements} />
      <Route path="/courses/:courseId" component={CourseDetail} />
      <Route path="/cards" component={VirtualCards} />
      <Route path="/cards/:id" component={CardDetail} />
      <Route path="/crypto/bitcoin-trading" component={BitcoinTrading} />
      <Route path="/crypto/bitcoin-tap-to-pay" component={BitcoinTapToPay} />
      <Route path="/admin/revenue" component={RevenueDashboard} />
      <Route path="/mobile/tap-to-pay" component={MobileTapToPayPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Simple auth debugger component
function AuthDebugger() {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        Auth Context: Missing
      </div>
    );
  }
  
  const { isAuthenticated, user, isLoading } = authContext;
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      Auth: {isAuthenticated ? '✅' : '❌'}<br/>
      {isLoading ? '⏳ Loading...' : ''}
      {user ? `User: ${user.username} (${user.id})` : 'Not logged in'}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PremiumUpsellProvider>
        <Router />
        <Toaster />
        <AuthDebugger />
      </PremiumUpsellProvider>
    </AuthProvider>
  );
}

export default App;
