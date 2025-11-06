import ServiceIntakeDetail from "@/features/service-intake/pages/ServiceIntakeDetail";

interface PageProps {
    params: {
        id: string;
    };
}

export default function ServiceIntakeDetailPage({ params }: PageProps) {
    return <ServiceIntakeDetail intakeId={params.id} />;
}
