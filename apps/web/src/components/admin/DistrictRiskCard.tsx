import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { AlertTriangle, MapPin, TrendingUp, ShieldAlert } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DistrictRisk {
    districtName: string;
    totalAdvisories: number;
    severityBreakdown: Record<string, number>;
    topRisks: string[];
    lastUpdated: string;
}

interface DistrictRiskCardProps {
    risks: DistrictRisk[];
}

const DistrictRiskCard: React.FC<DistrictRiskCardProps> = ({ risks }) => {
    const { language } = useLanguage();

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'EMERGENCY': return 'bg-red-500';
            case 'WARNING': return 'bg-orange-500';
            case 'WATCH': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                    {language === 'ne' ? 'जिल्ला अनुसार जोखिम विश्लेषण' : 'District-wise Risk Analytics'}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                    Live
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {risks.slice(0, 5).map((risk, index) => {
                        const total = risk.totalAdvisories || 1;
                        const highRiskCount = (risk.severityBreakdown['EMERGENCY'] || 0) + (risk.severityBreakdown['WARNING'] || 0);
                        const highRiskPercentage = Math.round((highRiskCount / total) * 100);

                        return (
                            <div key={`${risk.districtName}-${index}`} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold text-sm">{risk.districtName}</span>
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {risk.totalAdvisories} {language === 'ne' ? 'सल्लाहहरू' : 'Advisories'}
                                    </span>
                                </div>

                                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                                    {Object.entries(risk.severityBreakdown).map(([severity, count]) => (
                                        <div
                                            key={severity}
                                            className={`${getSeverityColor(severity)} h-full`}
                                            style={{ width: `${(count / total) * 100}%` }}
                                            title={`${severity}: ${count}`}
                                        />
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-1 mt-1">
                                    {risk.topRisks.slice(0, 2).map((r, i) => (
                                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {r}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {risks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm italic">
                            {language === 'ne' ? 'डाटा उपलब्ध छैन' : 'No analytics data available'}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DistrictRiskCard;
