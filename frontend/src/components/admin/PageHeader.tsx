import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, breadcrumbs, actions }) => {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="space-y-1.5">
                {breadcrumbs && (
                    <nav className="flex items-center text-sm text-muted-foreground mb-2">
                        <Link to="/admin/dashboard" className="hover:text-foreground transition-colors">
                            <Home className="h-4 w-4" />
                        </Link>
                        {breadcrumbs.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <ChevronRight className="h-4 w-4 mx-1" />
                                {item.href ? (
                                    <Link to={item.href} className="hover:text-foreground transition-colors">
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="text-foreground font-medium">{item.label}</span>
                                )}
                            </div>
                        ))}
                    </nav>
                )}
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
};

export default PageHeader;
