import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StatisticsData {
    totalBuku: number;
    totalAnggota: number;
    totalPeminjaman: number;
    totalPengembalian: number;
    bukuDipinjam: number;
    bukuTersedia: number;
    dendaTerkumpul: number;
}

interface RecentActivity {
    id: number;
    anggota_nama: string;
    judul_buku: string;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    status: string;
    denda: number;
}

interface ReportData {
    statistics: StatisticsData;
    recentActivities: RecentActivity[];
}

export class ReportService {
    private doc: jsPDF;
    private currentY: number = 65; // Starting Y position after header

    constructor() {
        this.doc = new jsPDF();
    }

    private addHeader() {
        // Logo atau Header
        this.doc.setFontSize(20);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('SiPerpus - Sistem Informasi Perpustakaan', 20, 20);

        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Laporan Dashboard Admin', 20, 30);

        // Tanggal laporan
        this.doc.setFontSize(10);
        this.doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`, 20, 40);

        // Line separator
        this.doc.setLineWidth(0.5);
        this.doc.line(20, 45, 190, 45);
    }

    private addStatistics(stats: StatisticsData) {
        let yPosition = this.currentY;

        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('STATISTIK PERPUSTAKAAN', 20, yPosition);

        yPosition += 10;

        // Statistics table
        const statisticsData = [
            ['Total Buku', stats.totalBuku.toLocaleString('id-ID')],
            ['Total Anggota', stats.totalAnggota.toLocaleString('id-ID')],
            ['Total Peminjaman', stats.totalPeminjaman.toLocaleString('id-ID')],
            ['Total Pengembalian', stats.totalPengembalian.toLocaleString('id-ID')],
            ['Buku Sedang Dipinjam', stats.bukuDipinjam.toLocaleString('id-ID')],
            ['Buku Tersedia', stats.bukuTersedia.toLocaleString('id-ID')],
            ['Total Denda Terkumpul', `Rp ${stats.dendaTerkumpul.toLocaleString('id-ID')}`],
        ];

        autoTable(this.doc, {
            startY: yPosition,
            head: [['Kategori', 'Jumlah']],
            body: statisticsData,
            theme: 'grid',
            headStyles: {
                fillColor: [34, 197, 94], // Green color
                textColor: 255,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 10,
            },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 40, halign: 'right' },
            },
        });

        // Update currentY for next section
        this.currentY = yPosition + (statisticsData.length + 2) * 8; // Estimate table height
    }

    private addRecentActivities(activities: RecentActivity[]) {
        let yPosition = this.currentY + 20;

        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('AKTIVITAS PEMINJAMAN TERBARU', 20, yPosition);

        yPosition += 5;

        if (activities.length === 0) {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text('Belum ada aktivitas peminjaman', 20, yPosition + 10);
            return;
        }

        // Activities table
        const activitiesData = activities.map((activity) => [
            activity.anggota_nama,
            activity.judul_buku,
            format(new Date(activity.tanggal_pinjam), 'dd/MM/yyyy'),
            activity.tanggal_kembali ? format(new Date(activity.tanggal_kembali), 'dd/MM/yyyy') : '-',
            activity.status === 'dipinjam' ? 'Dipinjam' : activity.status === 'dikembalikan' ? 'Dikembalikan' : 'Terlambat',
            activity.denda > 0 ? `Rp ${activity.denda.toLocaleString('id-ID')}` : '-',
        ]);

        autoTable(this.doc, {
            startY: yPosition + 5,
            head: [['Anggota', 'Judul Buku', 'Tgl Pinjam', 'Tgl Kembali', 'Status', 'Denda']],
            body: activitiesData,
            theme: 'grid',
            headStyles: {
                fillColor: [34, 197, 94], // Green color
                textColor: 255,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 8,
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 45 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 },
            },
        });

        // Update currentY for footer
        this.currentY = yPosition + (activities.length + 3) * 6; // Estimate table height
    }

    private addFooter() {
        const footerY = this.currentY + 20;

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Laporan ini dibuat secara otomatis oleh SiPerpus', 20, footerY);
        this.doc.text(`Copyright © ${new Date().getFullYear()} SiPerpus. All rights reserved.`, 20, footerY + 5);
    }

    public generateDashboardReport(data: ReportData): void {
        // Add all sections
        this.addHeader();
        this.addStatistics(data.statistics);
        this.addRecentActivities(data.recentActivities);
        this.addFooter();

        // Save the PDF
        const fileName = `Laporan_Dashboard_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
        this.doc.save(fileName);
    }

    public generateMonthlyReport(data: ReportData, month: string, year: string): void {
        // Similar to dashboard report but with month/year specific data
        this.addHeader();

        // Update header for monthly report
        this.doc.setFontSize(16);
        this.doc.text(`Laporan Bulanan - ${month} ${year}`, 100, 30);

        this.addStatistics(data.statistics);
        this.addRecentActivities(data.recentActivities);
        // this.addFooter();

        const fileName = `Laporan_Bulanan_${year}-${month.padStart(2, '0')}.pdf`;
        this.doc.save(fileName);
    }
}
