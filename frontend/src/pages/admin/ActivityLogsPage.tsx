import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    ClipboardList,
    RefreshCw,
    Clock,
    User,
    Activity,
    Info,
    Globe,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import adminService from '../../services/adminService';

const ActivityLogsPage = () => {
    const { language } = useLanguage();
    const { setTitle } = useAdminTitle();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingNext, setIsFetchingNext] = useState(false);

    useEffect(() => {
        setTitle('Activity Logs', 'गतिविधि लगहरू');
    }, [setTitle]);

    const fetchLogs = async (pageNumber, options = { append: false }) => {
        if (options.append) {
            setIsFetchingNext(true);
        } else {
            setLoading(true);
        }

        try {
            // Backend uses 0-indexed pages
            const data = await adminService.getUserActivities({ page: pageNumber, size: 20, sort: 'timestamp,desc' });

            if (data) {
                const newLogs = data.content || [];
                setLogs(prev => {
                    if (options.append) {
                        // Filter out duplicates based on ID if necessary, but backend should handle standard pagination pagination
                        return [...prev, ...newLogs];
                    }
                    return newLogs;
                });

                setPage(data.number);
                setHasMore(!data.last); // 'last' property from Spring Page interface
            }
        } catch (error) {
            console.error('Error fetching logs', error);
            if (!options.append) setLogs([]);
        } finally {
            setLoading(false);
            setIsFetchingNext(false);
        }
    };

    useEffect(() => {
        fetchLogs(0, { append: false });
    }, []);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastLogRef = useCallback((node: HTMLTableRowElement | null) => {
        if (loading || isFetchingNext) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchLogs(page + 1, { append: true });
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, isFetchingNext, hasMore, page]);


    const getActionColor = (action) => {
        if (action?.includes('LOGIN')) return 'bg-green-100 text-green-700';
        if (action?.includes('REGISTER')) return 'bg-purple-100 text-purple-700';
        if (action?.includes('VIEW')) return 'bg-blue-100 text-blue-700';
        if (action?.includes('ERROR')) return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        {language === 'ne' ? 'प्रयोगकर्ता गतिविधि' : 'User Activity Logs'}
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchLogs(0, { append: false })}
                        disabled={loading && !isFetchingNext}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading && !isFetchingNext ? 'animate-spin' : ''}`} />
                        {language === 'ne' ? 'ताजा गर्नुहोस्' : 'Refresh'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading && logs.length === 0 ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[180px]"><div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {language === 'ne' ? 'समय' : 'Timestamp'}</div></TableHead>
                                        <TableHead><div className="flex items-center gap-2"><User className="h-4 w-4" /> {language === 'ne' ? 'प्रयोगकर्ता ID' : 'User ID'}</div></TableHead>
                                        <TableHead><div className="flex items-center gap-2"><Activity className="h-4 w-4" /> {language === 'ne' ? 'कार्य' : 'Action'}</div></TableHead>
                                        <TableHead><div className="flex items-center gap-2"><Info className="h-4 w-4" /> {language === 'ne' ? 'विवरण' : 'Details'}</div></TableHead>
                                        <TableHead><div className="flex items-center gap-2"><Globe className="h-4 w-4" /> IP</div></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length > 0 ? (
                                        logs.map((log: any, index) => {
                                            const isLast = index === logs.length - 1;
                                            return (
                                                <TableRow
                                                    key={log.id}
                                                    ref={isLast ? lastLogRef : null}
                                                >
                                                    <TableCell className="font-medium">
                                                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {log.userId}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getActionColor(log.action) + " hover:bg-opacity-80"}>
                                                            {log.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-[300px] truncate" title={log.details}>
                                                        {log.details}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {log.ipAddress || 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                {language === 'ne' ? 'कुनै गतिविधि फेला परेन' : 'No activities found'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {isFetchingNext && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Loading more...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!hasMore && logs.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-xs text-gray-400">
                                                End of logs
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ActivityLogsPage;
