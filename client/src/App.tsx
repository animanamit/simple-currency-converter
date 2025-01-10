import { useForm } from "react-hook-form";
import "./App.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  amount: z.number().positive().multipleOf(0.01),
  currency: z.string().length(3),
});

const BASE_URL = import.meta.env.VITE_BASE_URL;

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const text = await response.text();
  console.log("Response status:", response.status);
  console.log("Response text:", text);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return JSON.parse(text);
};

const Converter = () => {
  const {
    data: names,
    error: namesError,
    isLoading: isNamesLoading,
  } = useSWR(`${BASE_URL}/json/names.json`, fetcher);

  const {
    data: currencies,
    error: currenciesError,
    isLoading: isCurrenciesLoading,
  } = useSWR(`${BASE_URL}/json/currencies.json`, fetcher);

  console.log(names, namesError, isNamesLoading);
  console.log(currencies, currenciesError, isCurrenciesLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <CardRow />
        <CardRow />
      </CardContent>
      <CardFooter>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  );
};

const CardRow = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      currency: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
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
                    placeholder="100"
                    type="number"
                    pattern="[0-9]*"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Description</FormDescription>
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
                  <Select {...field}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
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
