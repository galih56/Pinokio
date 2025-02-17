<?php

namespace App\Repositories;

use App\Interfaces\TagRepositoryInterface;
use App\Interfaces\FilterableRepositoryInterface;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;

class TagRepository extends FilterableRepository
implements FilterableRepositoryInterface, TagRepositoryInterface
{
    protected $related_data = [
        'issues'
    ];

    public function __construct(Tag $model)
    {
        parent::__construct($model);
    }
    
}
