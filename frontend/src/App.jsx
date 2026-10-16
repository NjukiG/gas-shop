import {
  HomeLayout,
  Landing,
  Error,
  Products,
  SingleProduct,
  Cart,
  About,
  Register,
  Login,
  Checkout,
  Orders,
} from "./pages";
import { Route, Routes } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoutes";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div>
      <HomeLayout />
      <Routes>
        <Route exact path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:ID" element={<SingleProduct />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private routes */}
        <Route element={<PrivateRoutes />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

        <Route path="*" element={<Error />} />
      </Routes>
      <Footer />
    </div>
  );
};
export default App;



// let queries=input.split('\n')
// queries.splice(0,1)
// let arr=[]
// let min=null;
// for(let query of queries){
//     query=query.split(' ')
//     let op=query[0]
//     let param=query[1]
//     if(op=='1'){
//         arr.push(param)            
//         if(parseFloat(param)<parseFloat(min)){
//             min=param
//         }else if(min===null){
//             min=param
//         }
//     }
//     if(op=='3'){
//         console.log(min)
//     }
//     if(op=='2'){
//         arr.splice(arr.indexOf(param),1)     
//         if(min==param){
//             min=Math.min(...arr)
//         }
//     }
// }