<?php
namespace App\Enums;

enum ProgressStatus: string {
    case Active = 'active';
    case Open = 'open';
    case Draft = 'draft';
    case Ongoing = 'on-going';
    case Finished = 'finished';
    case Closed = 'closed';
}

