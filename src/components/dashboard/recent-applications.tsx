import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecentApplication } from '@/types';
import { useRouter } from 'next/navigation';

interface RecentApplicationsProps {
  applications: RecentApplication[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  const router = useRouter();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'submitted':
        return 'default';
      case 'under_review':
        return 'default';
      case 'decided':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No applications yet</p>
            <p className="text-sm mt-1">
              Start by adding your first application
            </p>
            <Button className="mt-3" size="sm">
              Add Application
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {applications.map((application) => (
          <div
            key={application.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => router.push(`/applications/${application.id}`)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">
                  {application.universityName}
                </h4>
                <Badge variant={getStatusBadgeColor(application.status)}>
                  {application.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {application.applicationType}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Deadline: {formatDate(application.deadline)}</span>
                {application.submittedDate && (
                  <span>
                    Submitted: {formatDate(application.submittedDate)}
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline">
              View
            </Button>
          </div>
        ))}
        {applications.length > 0 && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => router.push('/applications')}
            >
              View All Applications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
