<!DOCTYPE html>
<html>
<head>
    <title>Laporan Infrastruktur Tuntasin</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #13376A; color: white; }
    </style>
</head>
<body>
    <h2>Rekapitulasi Laporan Infrastruktur - Tuntasin</h2>
    <p>Tanggal Unduh: {{ date('d F Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Judul Laporan</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Tanggal Lapor</th>
            </tr>
        </thead>
        <tbody>
            @forelse($submissions as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->label ?? $item->title ?? '-' }}</td>
                <td>{{ $item->location ?? '-' }}</td>
                <td>{{ strtoupper($item->status ?? 'PENDING') }}</td>
                <td>{{ $item->created_at ? $item->created_at->format('d/m/Y') : '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align: center;">Belum ada data laporan.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>