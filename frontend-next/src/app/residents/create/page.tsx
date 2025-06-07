'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Household {
    _id: string;
    apartmentNumber: string;
    active: boolean;
}

interface Resident {
    _id: string;
    fullName: string;
    dateOfBirth?: string;
    gender: string;
    idCard?: string;
    idCardDate?: string;
    idCardPlace?: string;
    placeOfBirth?: string;
    nationality: string;
    ethnicity: string;
    religion: string;
    occupation?: string;
    workplace?: string;
    phone?: string;
    household?: {
        _id: string;
        apartmentNumber: string;
    };
    note?: string;
    active: boolean;
}

export default function ResidentCreatePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const householdIdFromUrl = searchParams.get('household');
    const { user, token } = useAuth();

    const [households, setHouseholds] = useState<Household[]>([]);
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [idCard, setIdCard] = useState('');
    const [idCardDate, setIdCardDate] = useState('');
    const [idCardPlace, setIdCardPlace] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [nationality, setNationality] = useState('Việt Nam');
    const [ethnicity, setEthnicity] = useState('Kinh');
    const [religion, setReligion] = useState('Không');
    const [occupation, setOccupation] = useState('');
    const [workplace, setWorkplace] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedHouseholdId, setSelectedHouseholdId] = useState(householdIdFromUrl || 'none');
    const [note, setNote] = useState('');
    const [active, setActive] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!user || !token) {
            router.push('/login');
            return;
        }
        fetchHouseholds();
    }, [user, token]);

    const fetchHouseholds = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get('/api/households', config);
            setHouseholds(data.filter((h: Household) => h.active));
        } catch (error) {
            console.error('Lỗi khi tải danh sách hộ gia đình:', error);
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!fullName) errors.fullName = 'Họ tên là bắt buộc';
        if (!gender) errors.gender = 'Giới tính là bắt buộc';

        if (idCard && !/^\d+$/.test(idCard)) {
            errors.idCard = 'CMND/CCCD chỉ được chứa số';
        }

        if (phone && !/^\d+$/.test(phone)) {
            errors.phone = 'Số điện thoại chỉ được chứa số';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setError('');

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const residentData = {
                fullName,
                dateOfBirth: dateOfBirth || null,
                gender,
                idCard,
                idCardDate: idCardDate || null,
                idCardPlace,
                placeOfBirth,
                nationality,
                ethnicity,
                religion,
                occupation,
                workplace,
                phone,
                household: selectedHouseholdId === 'none' ? undefined : selectedHouseholdId,
                note,
                active
            };

            await axios.post('/api/residents', residentData, config);
            toast.success('Cư dân đã được tạo thành công');

            setTimeout(() => {
                router.push('/residents');
            }, 1500);
        } catch (error: any) {
            setError(
                error.response?.data?.message || 'Không thể tạo cư dân'
            );
            toast.error('Không thể tạo cư dân');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 h-screen">
                <Sidebar />
            </div>
            <div className="flex-1 ml-64 p-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/residents')}
                        className="hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại Danh sách Cư dân
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Thêm Cư Dân Mới</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={submitHandler} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ và Tên</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Nhập họ và tên"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className={validationErrors.fullName ? "border-red-500" : ""}
                                        />
                                        {validationErrors.fullName && (
                                            <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Giới Tính</Label>
                                        <Select
                                            value={gender}
                                            onValueChange={setGender}
                                        >
                                            <SelectTrigger className={validationErrors.gender ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Nam</SelectItem>
                                                <SelectItem value="female">Nữ</SelectItem>
                                                <SelectItem value="other">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.gender && (
                                            <p className="text-sm text-red-500">{validationErrors.gender}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Ngày Sinh</Label>
                                        <Input
                                            type="date"
                                            id="dateOfBirth"
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="idCard">CMND/CCCD</Label>
                                        <Input
                                            id="idCard"
                                            placeholder="Nhập CMND/CCCD"
                                            value={idCard}
                                            onChange={(e) => setIdCard(e.target.value)}
                                            className={validationErrors.idCard ? "border-red-500" : ""}
                                        />
                                        {validationErrors.idCard && (
                                            <p className="text-sm text-red-500">{validationErrors.idCard}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="idCardDate">Ngày Cấp</Label>
                                        <Input
                                            type="date"
                                            id="idCardDate"
                                            value={idCardDate}
                                            onChange={(e) => setIdCardDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="idCardPlace">Nơi Cấp</Label>
                                        <Input
                                            id="idCardPlace"
                                            placeholder="Nhập nơi cấp CMND/CCCD"
                                            value={idCardPlace}
                                            onChange={(e) => setIdCardPlace(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="placeOfBirth">Nơi Sinh</Label>
                                        <Input
                                            id="placeOfBirth"
                                            placeholder="Nhập nơi sinh"
                                            value={placeOfBirth}
                                            onChange={(e) => setPlaceOfBirth(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nationality">Quốc Tịch</Label>
                                        <Input
                                            id="nationality"
                                            placeholder="Nhập quốc tịch"
                                            value={nationality}
                                            onChange={(e) => setNationality(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ethnicity">Dân Tộc</Label>
                                        <Input
                                            id="ethnicity"
                                            placeholder="Nhập dân tộc"
                                            value={ethnicity}
                                            onChange={(e) => setEthnicity(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="religion">Tôn Giáo</Label>
                                        <Input
                                            id="religion"
                                            placeholder="Nhập tôn giáo"
                                            value={religion}
                                            onChange={(e) => setReligion(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">Nghề Nghiệp</Label>
                                        <Input
                                            id="occupation"
                                            placeholder="Nhập nghề nghiệp"
                                            value={occupation}
                                            onChange={(e) => setOccupation(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="workplace">Nơi Làm Việc</Label>
                                        <Input
                                            id="workplace"
                                            placeholder="Nhập nơi làm việc"
                                            value={workplace}
                                            onChange={(e) => setWorkplace(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số Điện Thoại</Label>
                                        <Input
                                            id="phone"
                                            placeholder="Nhập số điện thoại"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className={validationErrors.phone ? "border-red-500" : ""}
                                        />
                                        {validationErrors.phone && (
                                            <p className="text-sm text-red-500">{validationErrors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="household">Hộ Gia Đình</Label>
                                        <Select
                                            value={selectedHouseholdId}
                                            onValueChange={setSelectedHouseholdId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn hộ gia đình" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Không thuộc hộ nào</SelectItem>
                                                {households.map((household) => (
                                                    <SelectItem key={household._id} value={household._id}>
                                                        {household.apartmentNumber}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="note">Ghi Chú</Label>
                                    <Textarea
                                        id="note"
                                        placeholder="Nhập ghi chú (không bắt buộc)"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Tạo Mới'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 