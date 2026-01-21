import { ServiceRequestForm } from '@/components/service-request-form';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function FormSkeleton() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

export default function NewServiceRequestPage() {
  return (
    <div className="flex justify-center">
      <Suspense fallback={<FormSkeleton />}>
        <ServiceRequestForm />
      </Suspense>
    </div>
  );
}
