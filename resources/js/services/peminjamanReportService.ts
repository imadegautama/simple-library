import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PeminjamanData {
    id_peminjaman: number;
    tanggal_pinjam: string;
    tanggal_jatuh_tempo: string;
    tanggal_kembali?: string;
    status: string;
    denda?: number;
    nama_anggota: string;
    judul_buku?: string;
    pengarang?: string;
}

interface PeminjamanReportData {
    peminjaman: PeminjamanData[];
    summary: {
        totalPeminjaman: number;
        sedangDipinjam: number;
        sudahDikembalikan: number;
        terlambat: number;
        totalDenda: number;
    };
}

export class PeminjamanReportService {
    private doc: jsPDF;
    private currentY: number = 65;

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
        this.doc.text('Laporan Data Peminjaman', 20, 30);

        // Tanggal laporan
        this.doc.setFontSize(10);
        this.doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`, 20, 40);

        // Line separator
        this.doc.setLineWidth(0.5);
        this.doc.line(20, 45, 190, 45);
    }

    private addSummary(summary: PeminjamanReportData['summary']) {
        let yPosition = this.currentY;

        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('RINGKASAN PEMINJAMAN', 20, yPosition);

        yPosition += 10;

        const summaryData = [
            ['Total Peminjaman', summary.totalPeminjaman.toString()],
            ['Sedang Dipinjam', summary.sedangDipinjam.toString()],
            ['Sudah Dikembalikan', summary.sudahDikembalikan.toString()],
            ['Terlambat', summary.terlambat.toString()],
            ['Total Denda', `Rp ${summary.totalDenda.toLocaleString('id-ID')}`],
        ];

        autoTable(this.doc, {
            startY: yPosition,
            head: [['Kategori', 'Jumlah']],
            body: summaryData,
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

        this.currentY = yPosition + (summaryData.length + 3) * 8;
    }

    private addPeminjamanTable(peminjaman: PeminjamanData[]) {
        let yPosition = this.currentY + 20;

        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('DAFTAR PEMINJAMAN', 20, yPosition);

        yPosition += 5;

        if (peminjaman.length === 0) {
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text('Belum ada data peminjaman', 20, yPosition + 10);
            return;
        }

        const peminjamanData = peminjaman.map((item) => [
            item.nama_anggota,
            item.judul_buku || '-',
            format(new Date(item.tanggal_pinjam), 'dd/MM/yyyy'),
            format(new Date(item.tanggal_jatuh_tempo), 'dd/MM/yyyy'),
            item.tanggal_kembali ? format(new Date(item.tanggal_kembali), 'dd/MM/yyyy') : '-',
            item.status === 'dipinjam' ? 'Dipinjam' : item.status === 'dikembalikan' ? 'Dikembalikan' : 'Terlambat',
            item.denda && item.denda > 0 ? `Rp ${item.denda.toLocaleString('id-ID')}` : '-',
        ]);

        autoTable(this.doc, {
            startY: yPosition + 5,
            head: [['Peminjam', 'Buku', 'Tgl Pinjam', 'Jatuh Tempo', 'Tgl Kembali', 'Status', 'Denda']],
            body: peminjamanData,
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
                0: { cellWidth: 25 },
                1: { cellWidth: 35 },
                2: { cellWidth: 22 },
                3: { cellWidth: 22 },
                4: { cellWidth: 22 },
                5: { cellWidth: 20 },
                6: { cellWidth: 24 },
            },
        });

        this.currentY = yPosition + (peminjamanData.length + 3) * 6;
    }

    private addFooter() {
        const footerY = this.currentY + 20;

        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Laporan ini dibuat secara otomatis oleh SiPerpus', 20, footerY);
        this.doc.text(`Copyright © ${new Date().getFullYear()} SiPerpus. All rights reserved.`, 20, footerY + 5);
    }

    public generatePeminjamanReport(data: PeminjamanReportData): void {
        this.addHeader();
        this.addSummary(data.summary);
        this.addPeminjamanTable(data.peminjaman);
        // this.addFooter();

        const fileName = `Laporan_Peminjaman_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
        this.doc.save(fileName);
    }

    public generatePeminjamanByStatus(data: PeminjamanReportData, status: string): void {
        this.addHeader();

        // Update header for status-specific report
        this.doc.setFontSize(16);
        this.doc.text(`Laporan Peminjaman - ${status.charAt(0).toUpperCase() + status.slice(1)}`, 20, 30);

        // Filter data by status
        const filteredPeminjaman = data.peminjaman.filter((item) => item.status === status);

        const filteredSummary = {
            ...data.summary,
            totalPeminjaman: filteredPeminjaman.length,
        };

        this.addSummary(filteredSummary);
        this.addPeminjamanTable(filteredPeminjaman);
        this.addFooter();

        const fileName = `Laporan_Peminjaman_${status}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
        this.doc.save(fileName);
    }
}
