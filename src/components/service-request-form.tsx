'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Car,
  Flame,
  Fuel,
  ImageIcon,
  Loader2,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { summarizeRoadCondition } from '@/ai/flows/summarize-road-condition';
import { suggestStartingPrice } from '@/ai/flows/suggest-starting-price';

const formSchema = z.object({
  serviceType: z.string({ required_error: 'Please select a service type.' }),
  description: z.string().min(10, 'Please provide more details.'),
  distance: z.coerce.number().min(1, 'Distance must be at least 1 km.'),
  timeOfDay: z.string({ required_error: 'Please select time of day.' }),
  urgency: z.string({ required_error: 'Please select urgency.' }),
  photo: z.any().optional(),
});

type ServiceRequestFormValues = z.infer<typeof formSchema>;

const serviceTypes = [
  { value: 'отогрев', label: 'Car Heating', icon: Flame },
  { value: 'доставка топлива', label: 'Fuel Delivery', icon: Fuel },
  { value: 'техпомощь', label: 'Tech Help', icon: Wrench },
  { value: 'эвакуатор', label: 'Towing', icon: Truck },
];

export function ServiceRequestForm() {
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [priceReasoning, setPriceReasoning] = useState<string | null>(null);
  const [roadSummary, setRoadSummary] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setPhotoPreview(dataUri);
      form.setValue('photo', dataUri);
    }
  };

  const handleSuggestPrice = async () => {
    const { serviceType, distance, timeOfDay, urgency } = form.getValues();
    if (!serviceType || !distance || !timeOfDay || !urgency) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description:
          'Please fill out service type, distance, time, and urgency to suggest a price.',
      });
      return;
    }

    setIsPriceLoading(true);
    setSuggestedPrice(null);
    setPriceReasoning(null);

    try {
      const result = await suggestStartingPrice({
        serviceType,
        distance,
        timeOfDay,
        urgency,
      });
      setSuggestedPrice(result.suggestedPrice);
      setPriceReasoning(result.reasoning);
      toast({
        title: 'Price Suggested!',
        description: `We recommend a starting price of ${result.suggestedPrice} RUB.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not suggest a price. Please try again.',
      });
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handleSummarizeCondition = async () => {
    const photoDataUri = form.getValues('photo');
    if (!photoDataUri) {
      toast({
        variant: 'destructive',
        title: 'No Photo',
        description: 'Please upload a photo of the road to get a summary.',
      });
      return;
    }

    setIsSummaryLoading(true);
    setRoadSummary(null);

    try {
      const result = await summarizeRoadCondition({ photoDataUri });
      setRoadSummary(result.summary);
      toast({
        title: 'Summary Generated!',
        description:
          'AI has summarized the road conditions from your photo.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate summary. Please try again.',
      });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  async function onSubmit(data: ServiceRequestFormValues) {
    toast({
      title: 'Request Submitted!',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Service Request</CardTitle>
        <CardDescription>
          Fill out the details below to find a provider.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description of Issue</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., My car won't start, the battery seems dead. I'm near the Lena Pillars."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo of Road/Issue</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </FormControl>
                      {photoPreview && (
                        <div className="mt-2 relative">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="rounded-md object-cover max-h-40"
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {roadSummary && (
                  <div className="rounded-lg border bg-secondary/50 p-4">
                      <p className="text-sm font-medium">AI Road Summary:</p>
                      <p className="text-sm text-muted-foreground">{roadSummary}</p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSummarizeCondition}
                  disabled={isSummaryLoading || !form.watch('photo')}
                  className="w-full"
                >
                  {isSummaryLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Summarize Road Condition
                </Button>
              </div>

              <div className="space-y-6">
                <Card className="bg-secondary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Dynamic Pricing
                    </CardTitle>
                    <CardDescription>
                      Let AI suggest a fair starting price based on conditions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="distance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance to You (km)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 15"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="timeOfDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time of Day</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning</SelectItem>
                                <SelectItem value="afternoon">
                                  Afternoon
                                </SelectItem>
                                <SelectItem value="evening">Evening</SelectItem>
                                <SelectItem value="night">Night</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Urgency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select urgency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    {suggestedPrice && (
                      <div className="w-full text-center rounded-lg border bg-background p-4">
                        <p className="text-sm text-muted-foreground">
                          Suggested Starting Price
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {suggestedPrice.toLocaleString('ru-RU')} RUB
                        </p>
                        {priceReasoning && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {priceReasoning}
                          </p>
                        )}
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={handleSuggestPrice}
                      disabled={isPriceLoading}
                      className="w-full"
                    >
                      {isPriceLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Suggest Price
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full">
              Submit Request
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
