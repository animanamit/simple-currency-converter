import { useForm } from "react-hook-form";
import "./App.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR from "swr";
import { ChangeEvent, useEffect, useState } from "react";

const formSchema = z.object({
  amount: z.number().positive().multipleOf(0.01),
  currency: z.string().length(3),
});

// must match the server's base URL
const BASE_URL = import.meta.env.VITE_BASE_URL;

const ErrorComponent = ({ message }: { message: string }) => {
  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

const LoaderComponent = () => {
  return <div>Loading...</div>;
};

const calculateExchangeRate = (
  sourceCurrency: string = "",
  targetCurrency: string = "",
  exchangeRateData: { Abase: string; rates: { [key: string]: number } }
) => {
  const baseCurr = exchangeRateData.Abase;
  const baseCurrencyRate = exchangeRateData.rates[baseCurr];

  const exchangeRate =
    (exchangeRateData.rates[targetCurrency] /
      exchangeRateData.rates[sourceCurrency]) *
    baseCurrencyRate;

  return exchangeRate;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  const dataObj = Object.entries(data).map(([key, value]) => {
    return {
      abw: key,
      name: value,
    };
  });
  return dataObj;
};

const Converter = () => {
  const [isForward, setIsForward] = useState<boolean>(true);
  const [sourceCurrency, setSourceCurrency] = useState<string | undefined>("");
  const [targetCurrency, setTargetCurrency] = useState<string | undefined>("");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [amount, setAmount] = useState<string>("1");

  let sourceAmount;
  let targetAmount;

  if (isForward) {
    sourceAmount = amount;
    targetAmount = amount ? (Number(amount) * exchangeRate).toFixed(2) : 0;
  }

  if (!isForward) {
    sourceAmount = amount ? (Number(amount) / exchangeRate).toFixed(2) : 0;
    targetAmount = amount;
  }

  const {
    data: names,
    error: namesError,
    isLoading: isNamesLoading,
  } = useSWR(`${BASE_URL}/json/names.json`, fetcher);

  const {
    data: currencies,
    error: currenciesError,
    isLoading: isCurrenciesLoading,
  } = useSWR(`${BASE_URL}/json/currencies.json`, (url) =>
    fetch(url).then((res) => res.json())
  );

  const handleChangeSourceAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setIsForward(true);
    setAmount(e.target.value);
  };

  const handleChangeTargetAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setIsForward(false);
    setAmount(e.target.value);
  };

  useEffect(() => {
    if (names && currencies) {
      if (!sourceCurrency) setSourceCurrency(names?.[0].abw);
      if (!targetCurrency) setTargetCurrency(names?.[1].abw);
      setExchangeRate(
        calculateExchangeRate(
          sourceCurrency || names?.[0].abw,
          targetCurrency || names?.[1].abw,
          currencies
        )
      );
    }
  }, [names, currencies, sourceCurrency, targetCurrency]);

  if (namesError || currenciesError) {
    return <ErrorComponent message="Error loading data" />;
  }

  if (isNamesLoading || isCurrenciesLoading) {
    return <LoaderComponent />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <CardRow
          amount={sourceAmount}
          handleChangeAmount={handleChangeSourceAmount}
          selectedCurrency={sourceCurrency}
          handleChangeCurrency={(value: string) => setSourceCurrency(value)}
          currencyNames={names}
        />
        <CardRow
          amount={targetAmount}
          handleChangeAmount={handleChangeTargetAmount}
          selectedCurrency={targetCurrency}
          handleChangeCurrency={(value: string) => setTargetCurrency(value)}
          currencyNames={names}
        />
      </CardContent>
    </Card>
  );
};

const CardRow = ({
  amount,
  handleChangeAmount,
  selectedCurrency,
  handleChangeCurrency,
  currencyNames,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      currency: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="flex gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="0"
                    type="number"
                    pattern="[0-9]*"
                    value={amount}
                    onChange={handleChangeAmount}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    value={selectedCurrency}
                    onValueChange={handleChangeCurrency}
                  >
                    <SelectTrigger className="w-[380px]">
                      <SelectValue placeholder="Currency Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyNames?.map(
                        (item: { name: string; abw: string }) => (
                          <SelectItem key={item.abw} value={item.abw}>
                            {item.name} ({item.abw})
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

function App() {
  return (
    <>
      <Converter />
    </>
  );
}

export default App;
