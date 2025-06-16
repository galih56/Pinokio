<?php
namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

use App\Http\Resources\FormResponseResource;
use Illuminate\Support\Collection;

class FormResponseExport implements FromCollection, WithHeadings
{
    protected Collection $submissions;
    protected array $fieldLabels = [];

    public function __construct(Collection $submissions)
    {
        $this->submissions = FormResponseResource::collection($submissions)->toBase();

        // Gather all unique field labels from all entries
        $labels = [];
        foreach ($this->submissions as $submission) {
            foreach ($submission['entries'] ?? [] as $entry) {
                if (!empty($entry['formField']['label'])) {
                    $labels[] = $entry['formField']['label'];
                }
            }
        }

        // Remove duplicates and normalize
        $this->fieldLabels = array_values(array_unique($labels));
    
    }

    public function collection()
    {
        return $this->submissions->map(function ($submission) {
            $flat = $submission->toArray(request());

            // Base metadata
            $row = [
                'Submitted At' => $flat['submitted_at']->format('Y-m-d H:i:s'),
                // 'Total Entries' => $flat['total_entries'],
                // 'Has Attempts' => $flat['has_attempts'] ? 'Yes' : 'No',
            ];

            // Map entry values by field label
            $entryMap = [];
            foreach ($flat['entries'] ?? [] as $entry) {
                $label = $entry['form_field']['label'] ?? null;
                if ($label) {
                    $entryMap[$label] = $entry['value'];
                }
            }

            // Fill in all expected fields (some may be blank)
            foreach ($this->fieldLabels as $label) {
                $row[$label] = $entryMap[$label] ?? '';
            }

            return collect($row);
        });
    }

    public function headings(): array
    {
        return array_merge([
            'Submitted At',
            // 'Total Entries',
            // 'Has Attempts',
        ], $this->fieldLabels);
    }
}
