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
    <p>Tanggal Unduh: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Judul Laporan</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Prioritas (Vote)</th>
                <th>Tanggal Lapor</th>
            </tr>
        </thead>
        <tbody>
            @foreach($submissions as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->label }}</td>
                <td>{{ $item->location }}</td>
                <td>{{ strtoupper($item->status) }}</td>
                <td>{{ $item->votes()->count() }} Suara</td>
                <td>{{ $item->created_at->format('d/m/Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>