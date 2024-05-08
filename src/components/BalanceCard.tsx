import { Flex, Segmented, Skeleton } from "antd";
import {
  BaseCard,
  EditableText,
  TransferButton,
} from "../styles/renderComponents.ts";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch.ts";
import { RatesResponse } from "../context/UserTypes.ts";
import { useNavigate } from "react-router-dom";
import { useAccounts } from "../context/AccountsContext.tsx";
interface CurrencySymbols {
  [key: string]: string;
}
export const BalanceCard = () => {
  const { get } = useFetch();
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const usdBalance = accounts.reduce(
    (accumulator, account) => accumulator + Math.round(account.balance),
    0,
  );
  const [rates, setRates] = useState<RatesResponse>();
  const [balance, setBalance] = useState<string>(usdBalance + " " + "$");

  useEffect(() => {
    get<RatesResponse>(
      "https://v6.exchangerate-api.com/v6/96996cbc4ebe9898742f9d8c/latest/USD",
      {
        includeCredentials: false,
      },
    ).then((response) => setRates(response));
  }, []);

  if (!rates || !rates.conversion_rates) {
    return <Skeleton />;
  }

  const exchangeCurrencyRate = (currency: string) => {
    const currencySymbols: CurrencySymbols = {
      RUB: "₽",
      USD: "$",
      EUR: "€",
      AUD: "A$",
    };
    setBalance(
      Math.round(rates.conversion_rates[currency] * usdBalance) +
        " " +
        currencySymbols[currency],
    );
  };

  return (
    <BaseCard>
      <Flex vertical gap={"middle"}>
        <EditableText size={2} italic>
          Total balance
        </EditableText>
        <EditableText size={4}>
          {balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </EditableText>
        <Segmented
          style={{ width: "max-content" }}
          options={["USD", "RUB", "EUR", "AUD"]}
          onChange={(value) => exchangeCurrencyRate(value)}
        />
        <Flex justify={"space-between"}>
          <TransferButton
            type={"primary"}
            onClick={() => navigate("/transfer")}
            icon={<ArrowUpOutlined />}
          >
            Transfer
          </TransferButton>
          <TransferButton type={"primary"} icon={<ArrowDownOutlined />}>
            Receive
          </TransferButton>
        </Flex>
      </Flex>
    </BaseCard>
  );
};
