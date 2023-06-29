import { useEffect, useState } from "react";
import { FetchApplicationTemplates } from "../../../actions/fetch";
import { combineText } from "../../../utils/combineText";
import { installApp } from "../../../actions/app";
import { WarehousePush } from "../../../lib/warehouse";
import { useSelector } from "react-redux";

const ModalSelectVendor = (props) => {
  const { storeID } = props;

  const [vendors, setVendors] = useState([]);
  const [vendorChoosen, setVendorChoose] = useState({ id: null });
  const user = useSelector((state) => state.user);
  const hasPayment = user?.user_metadata?.hasPayment;

  useEffect(() => {
    FetchApplicationTemplates(storeID).then((result) => {
      setVendors(result);
    });
  }, []);

  const handleChooseVendor = (vendorId) => {
    const vendorFound = vendors.find(
      (vendor) => vendor.app_template_id == vendorId
    );
    setVendorChoose(vendorFound);
  };

  const handleInstallApp = () => {
    if (hasPayment) {
      WarehousePush(`user accept pay`, user.email, user.id);
      window.open(
        "https://www.facebook.com/messages/t/105408644972153/",
        "_blank"
      );
      return;
    }
    WarehousePush(`user click free trial`, user.email, user.id);
    installApp(vendorChoosen);
  };

  const renderVendorInfo = (data) => {
    // TODO handle filter
    const list = [];
    for (const key in data) {
      if (key == "id") {
        continue;
      }
      list.push(
        <div key={Math.random()}>
          <div className="flex gap-[4px]">
            <span className="font-medium">
              {data[key] && combineText(key) + ":"}{" "}
            </span>
            <span className="line-clamp-2">
              {" "}
              {typeof data[key] !== "object" && data[key]}
            </span>
          </div>
          <div
            style={{
              marginLeft: 15,
            }}
          >
            {typeof data[key] == "object" && renderVendorInfo(data[key])}
          </div>
        </div>
      );
    }

    return list;
  };

  const VendorInfo = (props) => {
    const { vendorInfo, isChoosen, onClick } = props;
    let outline = isChoosen ? "2px solid" : "none";
    return (
      <div
        style={{ outline }}
        onClick={onClick}
        className="border border-slate-400 border-solid	 rounded-xl p-[8px] cursor-pointer "
      >
        <h4 className="text-center mb-[8px]">Option</h4>
        {renderVendorInfo({
          ...vendorInfo,
          app_template_id: undefined,
        })}
      </div>
    );
  };

  return (
    <div className="h-full relative p-[16px]">
      <h3 className="mb-[24px] text-[1.6rem]">Select Vendor</h3>
      {vendors.length >= 1 ? (
        <>
          <div className="grid grid-cols-3 gap-[16px] ">
            {vendors.map((item) => (
              <VendorInfo
                key={Math.random()}
                vendorInfo={item}
                onClick={() => {
                  handleChooseVendor(item.app_template_id);
                }}
                isChoosen={
                  item.app_template_id == vendorChoosen.app_template_id
                }
              />
            ))}
          </div>

          <button
            className="instbtn h-[40px] max-w-[140px] absolute bottom-[5%] right-[5%] text-[1.6rem] font-medium border-none z-10"
            disabled={vendorChoosen.id == null}
            onClick={handleInstallApp}
          >
            {hasPayment ? "Pay to get" : "Free trial-30 minutes"}
          </button>
        </>
      ) : (
        <h3 className="text-center">
          Sorry:(( We're run out of VM, please give us a contact if you need ^^
        </h3>
      )}
    </div>
  );
};

export default ModalSelectVendor;
