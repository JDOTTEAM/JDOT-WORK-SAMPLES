<?php

namespace App\Jobs;

use App\Export\AssessmentsExport;
use App\Models\Assessment;
use App\Models\User;
use App\Notifications\Mobile\Assessment\AssessmentEmailAllNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;


class AssessmentsToEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var User
     */
    protected User $user;

    /**
     * Create a new job instance.
     *
     * @param User $user
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->user->is_admin) {

            $dogCollection = Assessment::withTrashed()
                ->where('type_of_assessment', 'CANINE ASSESSMENT')
                ->completed(true)
                ->with(['user', 'answers', 'shelterArchive'])
                ->latest('updated_at')
                ->withTrashed()
                ->get();

            $catCollection = Assessment::withTrashed()
                ->where('type_of_assessment', 'FELINE ASSESSMENT')
                ->completed(true)
                ->with(['user', 'answers', 'shelterArchive'])
                ->latest('updated_at')
                ->withTrashed()
                ->get();

        } else {

            $dogCollection = $this->user->assessments()
                ->completed(true)
                ->where('type_of_assessment', 'CANINE ASSESSMENT')
                ->with(['user', 'answers', 'shelterArchive'])
                ->latest('updated_at')
                ->get();

            $catCollection = $this->user->assessments()
                ->completed(true)
                ->where('type_of_assessment', 'FELINE ASSESSMENT')
                ->with(['user', 'answers', 'shelterArchive'])
                ->latest('updated_at')
                ->get();
        }

        $this->user->notify(
            new AssessmentEmailAllNotification(

                Excel::raw(new AssessmentsExport(

                    //коллекция котов
                    $catCollection->each(function ($assessment) {
                        $assessment->validateData();
                    }),

                    //коллекция сабак
                    $dogCollection->each(function ($assessment) {
                        $assessment->validateData();
                    }),

                    $this->user,

                ), \Maatwebsite\Excel\Excel::XLSX)
            )
        );
    }
}
