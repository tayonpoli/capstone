'use client';

import { UseFormReturn } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Inventory } from '@prisma/client';
import { Trash2 } from 'lucide-react';

type MaterialItemProps = {
    form: UseFormReturn<any>;
    index: number;
    rawMaterials: Inventory[];
    unitOptions: { value: string; label: string }[];
    onRemove: () => void;
    canRemove: boolean;
};

export function MaterialItem({
    form,
    index,
    rawMaterials,
    unitOptions,
    onRemove,
    canRemove,
}: MaterialItemProps) {
    return (
        <div className="grid grid-cols-12 gap-4 mb-4 items-end">
            <div className='col-span-3'>
                <FormField
                    control={form.control}
                    name={`materials.${index}.materialId`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Component</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rawMaterials.map((material) => (
                                            <SelectItem
                                                key={material.id}
                                                value={material.id}
                                                disabled={form.watch('materials').some((m: any, i: number) =>
                                                    i !== index && m.materialId === material.id
                                                )}
                                            >
                                                {material.product} (Stock: {material.stock} {material.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className=' flex flex-center gap-4 col-span-2'>
                <FormField
                    control={form.control}
                    name={`materials.${index}.qty`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl className='w-30'>
                                <Input
                                    type="number"
                                    step="1"
                                    min="1"
                                    placeholder="Qty"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={`materials.${index}.unit`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitOptions.map((unit) => (
                                            <SelectItem key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {canRemove && (
                <div>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onRemove}
                    >
                        Remove
                    </Button>
                </div>
            )}
        </div>
    );
}