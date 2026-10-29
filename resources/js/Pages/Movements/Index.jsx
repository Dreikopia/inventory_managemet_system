import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/Layouts/AppLayout";



const Index = ({ movements }) => {
    return (
        <div className="space-y-4 p-6">

            <div>
                <h1 className="text-xl font-bold">Movements</h1>
                <p className="text-sm text-muted-foreground">
                    Latest inventory movements
                </p>
            </div>

            <div className="rounded-md border bg-muted">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date and time</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead>User</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.map((movement) => (
                            <TableRow key={movement.id}>
                                <TableCell>
                                    {movement.created_at
                                        ? format(new Date(movement.created_at), "MMM dd, yyyy hh:mm a")
                                        : "—"}
                                </TableCell>
                                <TableCell>
                                    <p>
                                        {movement.inventory?.product?.name}
                                    </p>
                                    <p>

                                        {movement.inventory?.product?.sku}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    {movement.type}
                                </TableCell>
                                <TableCell>
                                    {movement.quantity}
                                </TableCell>
                                <TableCell>
                                    {movement.remarks}
                                </TableCell>
                                <TableCell>
                                    {movement.user?.name}
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

Index.layout = (page) => <AppLayout>{page}</AppLayout>

export default Index;